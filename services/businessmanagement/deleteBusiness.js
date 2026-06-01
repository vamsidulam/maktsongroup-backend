const Business = require("../../models/Business");

async function deleteBusiness({ id }) {
  const business = await Business.findOne({ _id: id, deletedAt: null });

  if (!business) {
    const err = new Error("Business not found");
    err.status = 404;
    throw err;
  }

  // Soft delete - set deletedAt timestamp
  business.deletedAt = new Date();
  await business.save();

  return { id: String(business._id), deletedAt: business.deletedAt };
}

module.exports = deleteBusiness;
