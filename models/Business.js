const { Schema, model, models, Types } = require("mongoose");

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    logoUrl: { type: String, default: "" },
    backgroundImageUrl: { type: String, default: "" },
    galleryImageUrls: { type: [String], default: [] },
    createdBy: { type: Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  {
    timestamps: true,
    collection: "businesses",
  }
);

businessSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = models.Business || model("Business", businessSchema);
