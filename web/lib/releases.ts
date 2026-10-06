export type AppRelease = {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  releaseNotes: string;
  publishedAt?: string;
};

export type ReleasesManifest = {
  releases: AppRelease[];
};

export function parseReleasesManifest(data: unknown): AppRelease[] {
  if (!data || typeof data !== "object") return [];
  const releases = (data as ReleasesManifest).releases;
  if (!Array.isArray(releases)) return [];
  return releases.filter(
    (item): item is AppRelease =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as AppRelease).versionName === "string" &&
      typeof (item as AppRelease).apkUrl === "string",
  );
}
