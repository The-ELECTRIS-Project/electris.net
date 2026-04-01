import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';

interface BlogIndexEntry {
	slug: string;
	metadata: Record<string, unknown>;
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
				const metadataPath = path.join(blogDir, entry.name, 'metadata.json');

				if (!fs.existsSync(metadataPath)) {
					return [];
				}

				try {
					const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as Record<string, unknown>;

					return [{ slug: entry.name, metadata }];
				} catch (error) {
					console.warn(
						`[blog-index] Skipping "${entry.name}" because metadata.json is invalid: ${
							error instanceof Error ? error.message : String(error)
						}`
					);

					return [];
				}
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

export default defineConfig(() => {
	return {
		plugins: [createBlogIndexPlugin(), sveltekit(), tailwindcss()],
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
