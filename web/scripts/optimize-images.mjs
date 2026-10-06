import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imagesDir = path.join(process.cwd(), "public", "images");

/** @type {Record<string, { width: number; height: number; quality: number }>} */
const rasterTargets = {
  "hero-phone.png": { width: 960, height: 960, quality: 82 },
  "feature-calendar.png": { width: 800, height: 600, quality: 82 },
  "feature-payroll.png": { width: 800, height: 600, quality: 82 },
};

const svgRasterOptions = { width: 800, height: 600, quality: 85 };

async function toWebp(inputName, outputName, options) {
  const input = path.join(imagesDir, inputName);
  try {
    await stat(input);
  } catch {
    return;
  }
  const output = path.join(imagesDir, outputName);
  await sharp(input)
    .rotate()
    .resize(options.width, options.height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: options.quality, effort: 6 })
    .toFile(output);

  const [before, after] = await Promise.all([stat(input), stat(output)]);
  console.log(
    `${inputName} -> ${outputName}: ${Math.round(before.size / 1024)}KB -> ${Math.round(after.size / 1024)}KB`,
  );
}

await mkdir(imagesDir, { recursive: true });

for (const [name, options] of Object.entries(rasterTargets)) {
  await toWebp(name, name.replace(/\.png$/i, ".webp"), options);
}

const files = await readdir(imagesDir);
for (const name of files.filter((f) => f.startsWith("feature-") && f.endsWith(".svg"))) {
  await toWebp(name, name.replace(/\.svg$/i, ".webp"), svgRasterOptions);
}
