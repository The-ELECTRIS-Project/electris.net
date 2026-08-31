import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

interface BlogRevisionRef {
	id: string;
	date: string;
	locales: string[];
	metadataLocales: string[];
}

interface BlogIndexEntry {
	slug: string;
	locales: string[];
	localizedMetadata: Record<string, Record<string, unknown>>;
	revisions: BlogRevisionRef[];
}

const LOCALE = /^([a-z]{2}_[A-Z]{2})$/;
const REVISION_ID = /^\d{4}-\d{2}-\d{2}(T\d{2}-\d{2})?$/;
const LANG_FILE = /^\+(commons|lang)\.[a-z]{2}_[A-Z]{2}\.json$/;

/*
 * Publishing an edit, by hand:
 *   1. mkdir revisions/<the date currently in the live metadata's `updated`, or `date` if this is
 *      the first edit> and copy the CURRENT +post/+metadata files into it
 *   2. edit the live files
 *   3. set `updated` to today and add an `editMotif` saying why
 * The snapshot holds the OLD text; the folder is named for when that old text went live.
 */
function readRevisions(postDir: string): BlogRevisionRef[] {
	const revisionsDir = path.join(postDir, 'revisions');
	if (!fs.existsSync(revisionsDir)) {
		return [];
	}

	return fs
		.readdirSync(revisionsDir, { withFileTypes: true })
		.filter((entry) => {
			if (!entry.isDirectory() || entry.name.startsWith('_')) return false;
			if (!REVISION_ID.test(entry.name)) {
				console.warn(`[blog-index] Ignoring revision "${entry.name}": name is not a date`);
				return false;
			}
			return true;
		})
		.map((entry) => {
			const files = fs.readdirSync(path.join(revisionsDir, entry.name));
			const collect = (pattern: RegExp) =>
				files
					.map((file) => file.match(pattern)?.[1])
					.filter((locale): locale is string => Boolean(locale && LOCALE.test(locale)))
					.sort();

			return {
				id: entry.name,
				date: entry.name.slice(0, 10),
				locales: collect(/^\+post\.(.+)\.html$/),
				metadataLocales: collect(/^\+metadata\.(.+)\.json$/)
			};
		})
		.filter((revision) => revision.locales.length > 0)
		.sort((a, b) => b.id.localeCompare(a.id));
}

function createBlogIndexPlugin(): Plugin {
	let root = process.cwd();

	const getPaths = () => {
		const blogDir = path.resolve(root, 'static', 'data', 'blog');
		const indexPath = path.join(blogDir, 'index.json');

		return { blogDir, indexPath };
	};

	const syncIndex = () => {
		const { blogDir, indexPath } = getPaths();

		if (!fs.existsSync(blogDir)) {
			return;
		}

		const indexEntries: BlogIndexEntry[] = fs
			.readdirSync(blogDir, { withFileTypes: true })
			.filter((entry) => entry.isDirectory() && !entry.name.startsWith('_'))
			.sort((a, b) => a.name.localeCompare(b.name))
			.flatMap((entry) => {
				const postDir = path.join(blogDir, entry.name);
				const files = fs
					.readdirSync(postDir, { withFileTypes: true })
					.filter((file) => file.isFile())
					.map((file) => file.name);
				
				const localizedMetadata: Record<string, Record<string, unknown>> = {};
				const locales: string[] = [];

				for (const file of files) {
					const match = file.match(/^\+metadata\.(.+)\.json$/);
					if (match) {
						const locale = match[1];
						const metadataPath = path.join(postDir, file);
						
						try {
							const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, unknown>;
							localizedMetadata[locale] = metadata;
							locales.push(locale);
						} catch (error) {
							console.warn(
								`[blog-index] Skipping locale "${locale}" for "${entry.name}" because metadata is invalid: ${
									error instanceof Error ? error.message : String(error)
								}`
							);
						}
					}
				}

				if (locales.length === 0) {
					return [];
				}

				return [{
					slug: entry.name,
					locales: locales.sort(),
					localizedMetadata,
					revisions: readRevisions(postDir)
				}];
			});

		const nextContents = `${JSON.stringify(indexEntries, null, 2)}\n`;
		const currentContents = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : null;

		if (currentContents !== nextContents) {
			fs.writeFileSync(indexPath, nextContents);
		}
	};

	const shouldSync = (filePath: string) => {
		const { blogDir, indexPath } = getPaths();
		const resolvedPath = path.resolve(filePath);

		return resolvedPath.startsWith(`${blogDir}${path.sep}`) && resolvedPath !== indexPath;
	};

	return {
		name: 'electris-blog-index',
		configResolved(config) {
			root = config.root;
		},
		buildStart() {
			syncIndex();
		},
		configureServer(server) {
			syncIndex();

			const handleChange = (filePath: string) => {
				if (shouldSync(filePath)) {
					syncIndex();
				}
			};

			server.watcher.on('add', handleChange);
			server.watcher.on('change', handleChange);
			server.watcher.on('unlink', handleChange);
			server.watcher.on('addDir', handleChange);
			server.watcher.on('unlinkDir', handleChange);
		}
	};
}

function createLangIndexPlugin(): Plugin {
	let root = process.cwd();

	const getPaths = () => {
		const langDir = path.resolve(root, 'static', 'data', 'lang');
		const indexPath = path.join(langDir, 'index.json');

		return { langDir, indexPath };
	};

	const collectLangFiles = (dir: string, prefix: string): string[] =>
		fs
			.readdirSync(dir, { withFileTypes: true })
			.flatMap((entry) => {
				const entryPath = path.join(dir, entry.name);
				const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

				if (entry.isDirectory()) {
					return collectLangFiles(entryPath, relativePath);
				}

				return LANG_FILE.test(entry.name) ? [relativePath] : [];
			});

	const syncIndex = () => {
		const { langDir, indexPath } = getPaths();

		if (!fs.existsSync(langDir)) {
			return;
		}

		const nextContents = `${JSON.stringify(collectLangFiles(langDir, '').sort(), null, 2)}\n`;
		const currentContents = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : null;

		if (currentContents !== nextContents) {
			fs.writeFileSync(indexPath, nextContents);
		}
	};

	const shouldSync = (filePath: string) => {
		const { langDir, indexPath } = getPaths();
		const resolvedPath = path.resolve(filePath);

		return resolvedPath.startsWith(`${langDir}${path.sep}`) && resolvedPath !== indexPath;
	};

	return {
		name: 'electris-lang-index',
		configResolved(config) {
			root = config.root;
		},
		buildStart() {
			syncIndex();
		},
		configureServer(server) {
			syncIndex();

			const handleChange = (filePath: string) => {
				if (shouldSync(filePath)) {
					syncIndex();
				}
			};

			server.watcher.on('add', handleChange);
			server.watcher.on('change', handleChange);
			server.watcher.on('unlink', handleChange);
			server.watcher.on('addDir', handleChange);
			server.watcher.on('unlinkDir', handleChange);
		}
	};
}

export default defineConfig(() => {
	return {
		plugins: [createBlogIndexPlugin(), createLangIndexPlugin(), sveltekit(), tailwindcss()],
		server: {
			host: '0.0.0.0',
			allowedHosts: ['.electris.net']
		},
		preview: {
			host: '0.0.0.0',
			allowedHosts: ['.electris.net']
		}
	};
});
