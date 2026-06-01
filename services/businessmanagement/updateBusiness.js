const Business = require("../../models/Business");
const { uploadImage, slugify, deleteImage } = require("../../helpers/upload");

async function updateBusiness({ id, patch, files, actor }) {
  const business = await Business.findOne({ _id: id, deletedAt: null });

  if (!business) {
    const err = new Error("Business not found");
    err.status = 404;
    throw err;
  }

  const actorId = actor && actor.id ? actor.id : null;
  const businessFolder = `businesses/${slugify(business.name)}`;

  // Update basic fields
  if (patch.name !== undefined) business.name = patch.name;
  if (patch.description !== undefined) business.description = patch.description;
  if (patch.url !== undefined) business.url = patch.url;
  if (patch.year !== undefined) business.year = patch.year;

  // Handle logo upload/removal
  if (files?.logo && files.logo[0]) {
    const logoFile = files.logo[0];
    const uploadResult = await uploadImage({
      buffer: logoFile.buffer,
      folder: businessFolder,
      publicId: "logo",
      mimetype: logoFile.mimetype,
      originalname: logoFile.originalname,
    });
    business.logoUrl = uploadResult.secure_url;
  }

  if (patch.removeLogoImage) {
    if (business.logoUrl) {
      await deleteImage(business.logoUrl);
    }
    business.logoUrl = "";
  }

  // Handle background image upload/removal
  if (files?.backgroundImage && files.backgroundImage[0]) {
    const bgFile = files.backgroundImage[0];
    const uploadResult = await uploadImage({
      buffer: bgFile.buffer,
      folder: businessFolder,
      publicId: "background",
      mimetype: bgFile.mimetype,
      originalname: bgFile.originalname,
    });
    business.backgroundImageUrl = uploadResult.secure_url;
  }

  if (patch.removeBackgroundImage) {
    if (business.backgroundImageUrl) {
      await deleteImage(business.backgroundImageUrl);
    }
    business.backgroundImageUrl = "";
  }

  // Handle gallery images upload
  if (files?.galleryImages && files.galleryImages.length > 0) {
    for (let i = 0; i < files.galleryImages.length; i++) {
      const galleryFile = files.galleryImages[i];
      const uploadResult = await uploadImage({
        buffer: galleryFile.buffer,
        folder: businessFolder,
        publicId: `gallery_${Date.now()}_${i}`,
        mimetype: galleryFile.mimetype,
        originalname: galleryFile.originalname,
      });
      business.galleryImageUrls.push(uploadResult.secure_url);
    }
  }

  // Handle gallery image removal (by index)
  if (patch.removeGalleryImages && Array.isArray(patch.removeGalleryImages)) {
    const indicesToRemove = patch.removeGalleryImages.sort((a, b) => b - a);
    for (const idx of indicesToRemove) {
      if (idx >= 0 && idx < business.galleryImageUrls.length) {
        const imageUrl = business.galleryImageUrls[idx];
        await deleteImage(imageUrl);
        business.galleryImageUrls.splice(idx, 1);
      }
    }
  }

  business.updatedBy = actorId;
  await business.save();

  return business;
}

module.exports = updateBusiness;
