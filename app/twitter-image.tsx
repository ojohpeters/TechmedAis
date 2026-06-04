// Reuse the same branded card for Twitter/X previews.
// `runtime`/`size`/`contentType` must be literal exports, so we re-declare them
// here rather than re-exporting (Next can't statically read re-exported literals).
export { default } from "./opengraph-image";

export const runtime = "edge";
export const alt = "TECHMED AIS Brainstorming — Think Smart. Perform Elite.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
