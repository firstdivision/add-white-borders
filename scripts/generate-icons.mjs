import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const sourceSvg = path.join(publicDir, "favicon.svg");
const iconsDir = path.join(publicDir, "icons");

const appleTouchSizes = [120, 152, 167, 180];
const manifestSizes = [192, 512];

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const generateAppleTouchIcons = async () => {
  await ensureDir(publicDir);

  await Promise.all(
    appleTouchSizes.map(async (size) => {
      const outputName = `apple-touch-icon-${size}x${size}.png`;
      const outputPath = path.join(publicDir, outputName);

      await sharp(sourceSvg)
        .resize(size, size, { fit: "cover" })
        .flatten({ background: "#ffffff" })
        .png()
        .toFile(outputPath);
    })
  );

  const primaryIcon = path.join(publicDir, "apple-touch-icon.png");
  await sharp(sourceSvg)
    .resize(180, 180, { fit: "cover" })
    .flatten({ background: "#ffffff" })
    .png()
    .toFile(primaryIcon);
};

const generateManifestIcons = async () => {
  await ensureDir(iconsDir);

  await Promise.all(
    manifestSizes.map(async (size) => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

      await sharp(sourceSvg)
        .resize(size, size, { fit: "cover" })
        .flatten({ background: "#ffffff" })
        .png()
        .toFile(outputPath);
    })
  );
};

const main = async () => {
  await generateAppleTouchIcons();
  await generateManifestIcons();
  console.log("Icons generated in public/.");
};

main().catch((error) => {
  console.error("Failed to generate icons:", error);
  process.exitCode = 1;
});
