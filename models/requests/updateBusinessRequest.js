const { z } = require("zod");

const updateBusinessRequest = z.object({
  name: z.string().min(1, "Business name is required").trim().optional(),
  description: z.string().min(1, "Description is required").trim().optional(),
  category: z.string().min(1, "Category is required").trim().optional(),
  shortNote: z.string().optional(),
  sequence: z.coerce.number().optional(),
  products: z.array(z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional().default(""),
    image: z.string().optional().default(""),
  })).optional(),
  existingSlideImages: z.array(z.string()).optional(),
  existingMobileSlideImages: z.array(z.string()).optional(),
  removeLogo: z.coerce.boolean().optional(),
  removeBackgroundImage: z.coerce.boolean().optional(),
  removeProductImages: z.array(z.coerce.number()).optional(),
});

module.exports = updateBusinessRequest;
