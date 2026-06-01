const Business = require("../../models/Business");
const { uploadImage, slugify } = require("../../helpers/upload");

async function createBusiness({ input, files, actor }) {
  const actorId = actor && actor.id ? actor.id : null;

  let logoUrl = "";
  let backgroundImageUrl = "";
  let galleryImageUrls = [];

  const businessFolder = `businesses/${slugify(input.name)}`;

  // Upload logo
  if (files.logo && files.logo[0]) {
    const logoFile = files.logo[0];
    const uploadResult = await uploadImage({
      buffer: logoFile.buffer,
      folder: businessFolder,
      publicId: "logo",
      mimetype: logoFile.mimetype,
      originalname: logoFile.originalname,
    });
    logoUrl = uploadResult.secure_url;
  }

  // Upload background image
  if (files.backgroundImage && files.backgroundImage[0]) {
    const bgFile = files.backgroundImage[0];
    const uploadResult = await uploadImage({
      buffer: bgFile.buffer,
      folder: businessFolder,
      publicId: "background",
      mimetype: bgFile.mimetype,
      originalname: bgFile.originalname,
    });
    backgroundImageUrl = uploadResult.secure_url;
  }

  // Upload gallery images
  if (files.galleryImages && files.galleryImages.length > 0) {
    for (let i = 0; i < files.galleryImages.length; i++) {
      const galleryFile = files.galleryImages[i];
      const uploadResult = await uploadImage({
        buffer: galleryFile.buffer,
        folder: businessFolder,
        publicId: `gallery_${i}`,
        mimetype: galleryFile.mimetype,
        originalname: galleryFile.originalname,
      });
      galleryImageUrls.push(uploadResult.secure_url);
    }
  }

  const business = await Business.create({
    name: input.name,
    description: input.description,
    url: input.url,
    year: input.year,
    logoUrl,
    backgroundImageUrl,
    galleryImageUrls,
    createdBy: actorId,
    updatedBy: actorId,
  });

  return business;
}

module.exports = createBusiness;
