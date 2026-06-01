const { z } = require("zod");

const listBusinessesQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

module.exports = listBusinessesQuery;
