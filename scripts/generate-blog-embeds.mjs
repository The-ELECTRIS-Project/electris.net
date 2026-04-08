import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = new Set(process.argv.slice(2));
const force = args.has('--force');
const verbose = args.has('--verbose');

const rootDir = path.resolve(process.cwd(), 'static', 'data', 'blog');

const log = (...parts) => {
  if (verbose) {
    console.log(...parts);
  }
};

const exists = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const isRemoteCover = (coverImage) => {
  return /^https?:\/\//i.test(coverImage);
};

const toAbsoluteStaticPath = (coverImage) => {
  const trimmed = coverImage.replace(/^\/+/, '');
  return path.resolve(process.cwd(), 'static', trimmed);
};

const resolveEmbedPath = (coverPath) => {
  return path.join(path.dirname(coverPath), 'cover-embed.jpg');
};

const shouldRegenerate = async (sourcePath, embedPath) => {
  if (force) return true;
  if (!(await exists(embedPath))) return true;

  const [sourceStat, embedStat] = await Promise.all([
    fs.stat(sourcePath),
    fs.stat(embedPath)
  ]);

  return sourceStat.mtimeMs > embedStat.mtimeMs;
};

const generateEmbed = async (sourcePath, embedPath) => {
  const image = sharp(sourcePath);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error('Missing image dimensions');
  }

  const width = Math.max(1, Math.round(metadata.width * 0.7));
  const height = Math.max(1, Math.round(metadata.height * 0.7));

  await fs.mkdir(path.dirname(embedPath), { recursive: true });

  const buffer = await image
    .resize(width, height)
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();

  await fs.writeFile(embedPath, buffer);

  return { width, height };
};

const run = async () => {
  let entries;
  try {
    entries = await fs.readdir(rootDir, { withFileTypes: true });
  } catch (err) {
    console.error('Unable to read blog directory:', err);
    process.exit(1);
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const metadataPath = path.join(rootDir, entry.name, 'metadata.json');
    if (!(await exists(metadataPath))) continue;

    try {
      const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
      const coverImage = metadata.coverImage;

      if (!coverImage) {
        log(`[skip] ${entry.name} has no coverImage`);
        skipped += 1;
        continue;
      }

      if (isRemoteCover(coverImage)) {
        console.warn(`[skip] ${entry.name} coverImage is remote: ${coverImage}`);
        skipped += 1;
        continue;
      }

      const sourcePath = toAbsoluteStaticPath(coverImage);
      if (!(await exists(sourcePath))) {
        console.warn(`[skip] ${entry.name} cover not found: ${sourcePath}`);
        skipped += 1;
        continue;
      }

      const embedPath = resolveEmbedPath(sourcePath);
      if (!(await shouldRegenerate(sourcePath, embedPath))) {
        log(`[skip] ${entry.name} embed is up to date`);
        skipped += 1;
        continue;
      }

      const { width, height } = await generateEmbed(sourcePath, embedPath);
      console.log(`[ok] ${entry.name} -> ${path.relative(process.cwd(), embedPath)} (${width}x${height})`);
      processed += 1;
    } catch (err) {
      console.error(`[fail] ${entry.name}`, err);
      failed += 1;
    }
  }

  console.log(`blog embed covers: ${processed} generated, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) {
    process.exitCode = 1;
  }
};

run();
