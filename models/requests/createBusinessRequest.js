const { z } = require("zod");

const createBusinessRequest = z.object({
  name: z.string().min(1, "Business name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  shortNote: z.string().optional().default(""),
  products: z.array(z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional().default(""),
    image: z.string().optional().default(""),
  })).optional().default([]),
});

module.exports = createBusinessRequest;
