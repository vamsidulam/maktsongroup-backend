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
  if (patch.sequence !== undefined) business.sequence = patch.sequence;
  if (patch.name !== undefined) business.name = patch.name;
  if (patch.description !== undefined) business.description = patch.description;
  if (patch.category !== undefined) business.category = patch.category;
  if (patch.shortNote !== undefined) business.shortNote = patch.shortNote;

  // Update products array
  if (patch.products !== undefined) {
    business.products = patch.products;
  }

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
    business.logo = uploadResult.secure_url;
  }

  if (patch.removeLogo) {
    if (business.logo) {
      await deleteImage(business.logo);
    }
    business.logo = "";
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
    business.backgroundImage = uploadResult.secure_url;
  }

  if (patch.removeBackgroundImage) {
    if (business.backgroundImage) {
      await deleteImage(business.backgroundImage);
    }
    business.backgroundImage = "";
  }

  // Handle slide images
  if (patch.existingSlideImages !== undefined || (files?.slideImages && files.slideImages.length > 0)) {
    // Start with existing slides the user kept
    const keptSlides = patch.existingSlideImages || [];

    // Upload new slide images in parallel
    let newSlideUrls = [];
    if (files?.slideImages && files.slideImages.length > 0) {
      const slideUploadPromises = files.slideImages.map((slideFile, i) =>
        uploadImage({
          buffer: slideFile.buffer,
          folder: `${businessFolder}/slides`,
          publicId: `slide_${Date.now()}_${i}`,
          mimetype: slideFile.mimetype,
          originalname: slideFile.originalname,
        })
      );
      const slideResults = await Promise.all(slideUploadPromises);
      newSlideUrls = slideResults.map((r) => r.secure_url);
    }

    business.slideImages = [...keptSlides, ...newSlideUrls];
  }

  // Handle mobile slide images
  if (patch.existingMobileSlideImages !== undefined || (files?.mobileSlideImages && files.mobileSlideImages.length > 0)) {
    const keptMobileSlides = patch.existingMobileSlideImages || [];

    let newMobileSlideUrls = [];
    if (files?.mobileSlideImages && files.mobileSlideImages.length > 0) {
      const mobileSlideUploadPromises = files.mobileSlideImages.map((slideFile, i) =>
        uploadImage({
          buffer: slideFile.buffer,
          folder: `${businessFolder}/mobile-slides`,
          publicId: `mobile_slide_${Date.now()}_${i}`,
          mimetype: slideFile.mimetype,
          originalname: slideFile.originalname,
        })
      );
      const mobileSlideResults = await Promise.all(mobileSlideUploadPromises);
      newMobileSlideUrls = mobileSlideResults.map((r) => r.secure_url);
    }

    business.mobileSlideImages = [...keptMobileSlides, ...newMobileSlideUrls];
  }

  // Handle product images upload
  if (files?.productImages && files.productImages.length > 0) {
    for (let i = 0; i < files.productImages.length; i++) {
      const productFile = files.productImages[i];
      const uploadResult = await uploadImage({
        buffer: productFile.buffer,
        folder: `${businessFolder}/products`,
        publicId: `product_${Date.now()}_${i}`,
        mimetype: productFile.mimetype,
        originalname: productFile.originalname,
      });

      // Assign to corresponding product if it exists
      if (business.products[i]) {
        business.products[i].image = uploadResult.secure_url;
      }
    }
  }

  // Handle product image removal (by index)
  if (patch.removeProductImages && Array.isArray(patch.removeProductImages)) {
    for (const idx of patch.removeProductImages) {
      if (idx >= 0 && idx < business.products.length) {
        const imageUrl = business.products[idx].image;
        if (imageUrl) {
          await deleteImage(imageUrl);
          business.products[idx].image = "";
        }
      }
    }
  }

  business.updatedBy = actorId;
  await business.save();

  return business;
}

module.exports = updateBusiness;
