import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "web", "package.json"));
const sharp = require("sharp");
const src = path.join(root, "web", "public", "icon.png");
const resRoot = path.join(root, "app", "src", "main", "res");

/** Android launcher densities: 108dp base */
const DENSITIES = {
  "mipmap-mdpi": 108,
  "mipmap-hdpi": 162,
  "mipmap-xhdpi": 216,
  "mipmap-xxhdpi": 324,
  "mipmap-xxxhdpi": 432,
};

/** Logo occupies ~66% of canvas (adaptive icon safe zone). */
const SAFE_RATIO = 0.66;

function toHex([r, g, b]) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Center-crop wide source art to a square launcher canvas. */
async function squareIconBuffer(input) {
  const { width, height } = await sharp(input).metadata();
  const side = Math.min(width, height);
  const left = Math.floor((width - side) / 2);
  const top = Math.floor((height - side) / 2);
  return sharp(input).extract({ left, top, width: side, height: side }).png().toBuffer();
}

/** Sample the green squircle fill (not outer letterbox or logo ink). */
async function extractBackgroundHex(iconBuffer) {
  const { width } = await sharp(iconBuffer).metadata();
  const points = [
    [0.5, 0.08],
    [0.18, 0.18],
    [0.82, 0.18],
    [0.18, 0.82],
    [0.82, 0.82],
  ];
  const samples = await Promise.all(
    points.map(([fx, fy]) =>
      sharp(iconBuffer)
        .extract({
          left: Math.floor(width * fx),
          top: Math.floor(width * fy),
          width: 1,
          height: 1,
        })
        .raw()
        .toBuffer(),
    ),
  );
  const avg = [0, 0, 0];
  for (const buf of samples) {
    avg[0] += buf[0];
    avg[1] += buf[1];
    avg[2] += buf[2];
  }
  return toHex(avg.map((v) => Math.round(v / samples.length)));
}

async function main() {
  if (!fs.existsSync(src)) {
    console.error("Missing source icon:", src);
    process.exit(1);
  }

  const meta = await sharp(src).metadata();
  const iconBuffer = await squareIconBuffer(src);
  const iconMeta = await sharp(iconBuffer).metadata();
  const bgHex = await extractBackgroundHex(iconBuffer);

  console.log(
    `Source: ${meta.width}x${meta.height} -> square ${iconMeta.width}x${iconMeta.height} -> background ${bgHex}`,
  );

  const bgColorPath = path.join(resRoot, "values", "ic_launcher_background.xml");
  fs.writeFileSync(
    bgColorPath,
    `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${bgHex}</color>\n</resources>\n`,
    "utf8",
  );

  for (const [folder, size] of Object.entries(DENSITIES)) {
    const dir = path.join(resRoot, folder);
    fs.mkdirSync(dir, { recursive: true });

    const inner = Math.round(size * SAFE_RATIO);
    const logo = await sharp(iconBuffer).resize(inner, inner, { fit: "contain" }).png().toBuffer();
    const pad = Math.round((size - inner) / 2);

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: bgHex,
      },
    })
      .composite([{ input: logo, left: pad, top: pad }])
      .png()
      .toFile(path.join(dir, "ic_launcher_foreground.png"));

    const launcherPath = path.join(dir, "ic_launcher.png");
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 3,
        background: bgHex,
      },
    })
      .composite([{ input: logo, left: pad, top: pad }])
      .png()
      .toFile(launcherPath);

    await fs.promises.copyFile(launcherPath, path.join(dir, "ic_launcher_round.png"));

    console.log(`${folder}: ${size}px (logo ${inner}px + ${pad}px pad)`);
  }

  console.log("Done. Adaptive icon uses @mipmap/ic_launcher_foreground + background color.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
