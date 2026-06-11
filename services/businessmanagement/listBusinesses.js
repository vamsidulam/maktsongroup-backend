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
      .sort({ sequence: 1, createdAt: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    const transformed = rows.map(row => ({
      ...row,
      id: String(row._id),
      _id: undefined
    }));

    return {
      rows: transformed,
      total: transformed.length,
    };
  }

  // Otherwise, use pagination
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    Business.find(filter)
      .sort({ sequence: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Business.countDocuments(filter),
  ]);

  // Transform _id to id for frontend compatibility
  const transformed = rows.map(row => ({
    ...row,
    id: String(row._id),
    _id: undefined
  }));

  const pages = Math.ceil(total / limit);

  return {
    rows: transformed,
    total,
    page,
    limit,
    pages,
  };
}

module.exports = listBusinesses;
