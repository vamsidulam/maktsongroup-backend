const fs = require("fs");
const path = require("path");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

const MIME_TO_EXT = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function slugify(value) {
  const base = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return base || "business";
}

function pickExtension({ mimetype, originalname }) {
  if (mimetype && MIME_TO_EXT[mimetype]) return MIME_TO_EXT[mimetype];
  if (originalname) {
    const ext = path.extname(String(originalname)).replace(".", "").toLowerCase();
    if (ext) return ext;
  }
  return "png";
}

function getPublicBaseUrl() {
  const base = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 3001}`;
  return base.replace(/\/+$/, "");
}

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_ROOT)) {
    fs.mkdirSync(UPLOADS_ROOT, { recursive: true });
  }
}

async function uploadImage({ buffer, folder, publicId, mimetype, originalname }) {
  if (!buffer || !buffer.length) {
    throw new Error("uploadImage: buffer is required");
  }

  const safeFolder = String(folder || "")
    .split("/")
    .map((seg) => slugify(seg))
    .filter(Boolean)
    .join("/");
  const safePublicId = slugify(publicId) || `file_${Date.now()}`;
  const ext = pickExtension({ mimetype, originalname });

  const targetDir = safeFolder
    ? path.join(UPLOADS_ROOT, safeFolder)
    : UPLOADS_ROOT;
  await fs.promises.mkdir(targetDir, { recursive: true });

  const filename = `${safePublicId}.${ext}`;
  const targetPath = path.join(targetDir, filename);
  await fs.promises.writeFile(targetPath, buffer);

  const relPath = [safeFolder, filename].filter(Boolean).join("/");
  const secureUrl = `${getPublicBaseUrl()}/uploads/${relPath}`;
  return { secure_url: secureUrl };
}

async function deleteImage(filePath) {
  try {
    const fullPath = path.join(UPLOADS_ROOT, filePath.replace(/^.*\/uploads\//, ""));
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
  }
}

module.exports = { uploadImage, deleteImage, slugify, ensureUploadsDir, UPLOADS_ROOT };
