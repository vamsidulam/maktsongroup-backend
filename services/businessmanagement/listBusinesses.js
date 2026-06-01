const Business = require("../../models/Business");

async function listBusinesses({ page, limit, search, includeDeleted, noPagination }) {
  const filter = includeDeleted ? {} : { deletedAt: null };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  // If noPagination is true, return all results
  if (noPagination) {
    const rows = await Business.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return {
      rows,
      total: rows.length,
    };
  }

  // Otherwise, use pagination
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Business.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Business.countDocuments(filter),
  ]);

  const pages = Math.ceil(total / limit);

  return {
    rows,
    total,
    page,
    limit,
    pages,
  };
}

module.exports = listBusinesses;
