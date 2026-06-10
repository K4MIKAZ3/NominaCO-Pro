import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imagesDir = path.join(process.cwd(), "public", "images");

/** @type {Record<string, { width: number; height: number; quality: number }>} */
const pngTargets = {
  "hero-phone.png": { width: 960, height: 960, quality: 82 },
  "feature-calendar.png": { width: 800, height: 600, quality: 82 },
  "feature-payroll.png": { width: 800, height: 600, quality: 82 },
};

async function optimizePng(name, options) {
  const input = path.join(imagesDir, name);
  const output = path.join(imagesDir, name.replace(/\.png$/i, ".webp"));
  await sharp(input)
    .rotate()
    .resize(options.width, options.height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: options.quality, effort: 6 })
    .toFile(output);

  const [before, after] = await Promise.all([stat(input), stat(output)]);
  console.log(
    `${name} -> ${path.basename(output)}: ${Math.round(before.size / 1024)}KB -> ${Math.round(after.size / 1024)}KB`,
  );
}

async function minifySvg(name) {
  const { optimize } = await import("svgo");
  const { readFile, writeFile } = await import("node:fs/promises");
  const file = path.join(imagesDir, name);
  const source = await readFile(file, "utf8");
  const result = optimize(source, {
    path: file,
    multipass: true,
    plugins: ["preset-default", { name: "removeViewBox", active: false }],
  });
  if ("data" in result) {
    await writeFile(file, result.data);
    console.log(`SVGO ${name}: ${source.length} -> ${result.data.length} bytes`);
  }
}

await mkdir(imagesDir, { recursive: true });

for (const [name, options] of Object.entries(pngTargets)) {
  await optimizePng(name, options);
}

const files = await readdir(imagesDir);
for (const name of files.filter((f) => f.endsWith(".svg"))) {
  await minifySvg(name);
}
