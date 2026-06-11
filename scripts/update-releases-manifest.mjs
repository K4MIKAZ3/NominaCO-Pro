import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const versionName = process.env.VERSION_NAME;
const versionCode = Number.parseInt(process.env.VERSION_CODE ?? "", 10);
let releaseNotes = process.env.RELEASE_NOTES?.trim();
if (!releaseNotes) {
  try {
    releaseNotes = fs.readFileSync(path.join(process.cwd(), "release-notes.txt"), "utf8").trim();
  } catch {
    releaseNotes = "";
  }
}
if (!releaseNotes) {
  releaseNotes = `Actualización de Nominapp v${versionName}.`;
}

if (!versionName || Number.isNaN(versionCode)) {
  console.error("VERSION_NAME and VERSION_CODE are required.");
  process.exit(1);
}

const repo = "K4MIKAZ3/NominaCO-Pro";
const apkUrl = `https://github.com/${repo}/releases/download/v${versionName}/Nominapp.apk`;
const publishedAt = new Date().toISOString().slice(0, 10);

const apkPath = path.join(process.cwd(), "Nominapp.apk");
if (!fs.existsSync(apkPath)) {
  console.error("Nominapp.apk not found. Build the release APK before updating manifests.");
  process.exit(1);
}

const sha256 = crypto.createHash("sha256").update(fs.readFileSync(apkPath)).digest("hex");
console.log(`APK SHA-256: ${sha256}`);

const newRelease = {
  versionCode,
  versionName,
  apkUrl,
  sha256,
  releaseNotes,
  publishedAt,
};

const webPublic = path.join(process.cwd(), "web", "public");
const releasesPath = path.join(webPublic, "releases.json");
const versionPath = path.join(webPublic, "version.json");

let existing = [];
try {
  const parsed = JSON.parse(fs.readFileSync(releasesPath, "utf8"));
  if (Array.isArray(parsed.releases)) {
    existing = parsed.releases;
  }
} catch {
  // First run or missing file.
}

const releases = [
  newRelease,
  ...existing.filter((item) => item.versionName !== versionName),
].slice(0, 3);

fs.mkdirSync(webPublic, { recursive: true });
fs.writeFileSync(
  releasesPath,
  `${JSON.stringify({ releases }, null, 2)}\n`,
  "utf8",
);
fs.writeFileSync(
  versionPath,
  `${JSON.stringify(
    {
      versionCode: newRelease.versionCode,
      versionName: newRelease.versionName,
      apkUrl: newRelease.apkUrl,
      sha256: newRelease.sha256,
      releaseNotes: newRelease.releaseNotes,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Updated releases manifest (${releases.length} version(s)).`);
