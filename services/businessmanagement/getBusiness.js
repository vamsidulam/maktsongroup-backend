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

  return business;
}

module.exports = getBusiness;
