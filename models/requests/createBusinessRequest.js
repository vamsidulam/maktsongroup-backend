const { z } = require("zod");

const createBusinessRequest = z.object({
  name: z.string().min(1, "Business name is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  url: z.string().url("Invalid URL").trim(),
  year: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
});

module.exports = createBusinessRequest;
