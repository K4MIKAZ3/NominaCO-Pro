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

const newRelease = {
  versionCode,
  versionName,
  apkUrl,
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
      apkUrl: `https://github.com/${repo}/releases/latest/download/Nominapp.apk`,
      releaseNotes: newRelease.releaseNotes,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Updated releases manifest (${releases.length} version(s)).`);
