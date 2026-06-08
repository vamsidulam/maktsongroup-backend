const Business = require("../../models/Business");
const { uploadImage, slugify } = require("../../helpers/upload");

async function createBusiness({ input, files, actor }) {
  const actorId = actor && actor.id ? actor.id : null;

  let logo = "";
  let backgroundImage = "";
  const products = input.products || [];
  const slideImages = [];

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
    logo = uploadResult.secure_url;
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
    backgroundImage = uploadResult.secure_url;
  }

  // Upload slide images
  if (files.slideImages && files.slideImages.length > 0) {
    for (let i = 0; i < files.slideImages.length; i++) {
      const slideFile = files.slideImages[i];
      const uploadResult = await uploadImage({
        buffer: slideFile.buffer,
        folder: `${businessFolder}/slides`,
        publicId: `slide_${i}`,
        mimetype: slideFile.mimetype,
        originalname: slideFile.originalname,
      });
      slideImages.push(uploadResult.secure_url);
    }
  }

  // Upload product images
  if (files.productImages && files.productImages.length > 0) {
    for (let i = 0; i < files.productImages.length; i++) {
      const productFile = files.productImages[i];
      const uploadResult = await uploadImage({
        buffer: productFile.buffer,
        folder: `${businessFolder}/products`,
        publicId: `product_${i}`,
        mimetype: productFile.mimetype,
        originalname: productFile.originalname,
      });

      // Assign image to corresponding product
      if (products[i]) {
        products[i].image = uploadResult.secure_url;
      }
    }
  }

  const business = await Business.create({
    name: input.name,
    logo,
    backgroundImage,
    description: input.description,
    category: input.category,
    shortNote: input.shortNote || "",
    slideImages,
    products,
    createdBy: actorId,
    updatedBy: actorId,
  });

  return business;
}

module.exports = createBusiness;
