const { z } = require("zod");

const updateBusinessRequest = z.object({
  name: z.string().min(1, "Business name is required").trim().optional(),
  description: z.string().min(1, "Description is required").trim().optional(),
  url: z.string().url("Invalid URL").trim().optional(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  removeLogoImage: z.coerce.boolean().optional(),
  removeBackgroundImage: z.coerce.boolean().optional(),
  removeGalleryImages: z.array(z.coerce.number()).optional(),
});

module.exports = updateBusinessRequest;
