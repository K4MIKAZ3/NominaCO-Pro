import fs from "node:fs";
import path from "node:path";

const gradlePath = path.join(process.cwd(), "app", "build.gradle.kts");
const content = fs.readFileSync(gradlePath, "utf8");

const codeMatch = content.match(/versionCode\s*=\s*(\d+)/);
const nameMatch = content.match(/versionName\s*=\s*"([^"]+)"/);

if (!codeMatch || !nameMatch) {
  console.error("No se encontró versionCode o versionName en app/build.gradle.kts");
  process.exit(1);
}

const nextCode = Number.parseInt(codeMatch[1], 10) + 1;
const parts = nameMatch[1].split(".").map((part) => Number.parseInt(part, 10));
while (parts.length < 3) parts.push(0);
parts[2] += 1;
const nextName = parts.join(".");

const nextContent = content
  .replace(/versionCode\s*=\s*\d+/, `versionCode = ${nextCode}`)
  .replace(/versionName\s*=\s*"[^"]+"/, `versionName = "${nextName}"`);

fs.writeFileSync(gradlePath, nextContent, "utf8");
console.log(`Versión actualizada: ${nextName} (versionCode ${nextCode})`);
