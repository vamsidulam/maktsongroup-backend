const Business = require("../../models/Business");
const { uploadImage, slugify } = require("../../helpers/upload");

async function createBusiness({ input, files, actor }) {
  const actorId = actor && actor.id ? actor.id : null;

  let logo = "";
  let backgroundImage = "";
  const products = input.products || [];
  const slideImages = [];
  const mobileSlideImages = [];

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

  // Upload slide images in parallel
  if (files.slideImages && files.slideImages.length > 0) {
    const slideUploadPromises = files.slideImages.map((slideFile, i) =>
      uploadImage({
        buffer: slideFile.buffer,
        folder: `${businessFolder}/slides`,
        publicId: `slide_${i}`,
        mimetype: slideFile.mimetype,
        originalname: slideFile.originalname,
      })
    );
    const slideResults = await Promise.all(slideUploadPromises);
    slideResults.forEach(result => slideImages.push(result.secure_url));
  }

  // Upload mobile slide images in parallel
  if (files.mobileSlideImages && files.mobileSlideImages.length > 0) {
    const mobileSlideUploadPromises = files.mobileSlideImages.map((slideFile, i) =>
      uploadImage({
        buffer: slideFile.buffer,
        folder: `${businessFolder}/mobile-slides`,
        publicId: `mobile_slide_${i}`,
        mimetype: slideFile.mimetype,
        originalname: slideFile.originalname,
      })
    );
    const mobileSlideResults = await Promise.all(mobileSlideUploadPromises);
    mobileSlideResults.forEach(result => mobileSlideImages.push(result.secure_url));
  }

  // Upload product images in parallel
  if (files.productImages && files.productImages.length > 0) {
    const productUploadPromises = files.productImages.map((productFile, i) =>
      uploadImage({
        buffer: productFile.buffer,
        folder: `${businessFolder}/products`,
        publicId: `product_${i}`,
        mimetype: productFile.mimetype,
        originalname: productFile.originalname,
      })
    );
    const productResults = await Promise.all(productUploadPromises);

    // Assign images to corresponding products
    productResults.forEach((result, i) => {
      if (products[i]) {
        products[i].image = result.secure_url;
      }
    });
  }

  const business = await Business.create({
    name: input.name,
    logo,
    backgroundImage,
    description: input.description,
    category: input.category,
    shortNote: input.shortNote || "",
    slideImages,
    mobileSlideImages,
    products,
    createdBy: actorId,
    updatedBy: actorId,
  });

  return business;
}

module.exports = createBusiness;
