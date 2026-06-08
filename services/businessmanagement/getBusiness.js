const Business = require("../../models/Business");

async function getBusiness({ id, includeDeleted }) {
  const filter = { _id: id };
  if (!includeDeleted) {
    filter.deletedAt = null;
  }

  const business = await Business.findOne(filter).lean();

  if (!business) {
    const err = new Error("Business not found");
    err.status = 404;
    throw err;
  }

  // Transform _id to id for frontend compatibility
  return {
    ...business,
    id: String(business._id),
    _id: undefined
  };
}

module.exports = getBusiness;
