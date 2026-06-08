const { Schema, model, models, Types } = require("mongoose");

const businessSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    logo: { type: String, default: "" },                    // Logo image URL
    backgroundImage: { type: String, default: "" },         // Background/hero image URL
    description: { type: String, required: true, trim: true }, // Short description
    category: { type: String, required: true, trim: true }, // Business category
    shortNote: { type: String, default: "" },               // Tagline/short note
    slideImages: [{ type: String }],                        // Slider/gallery images
    products: [                                             // Products with images
      {
        name: { type: String, required: true },
        image: { type: String, default: "" },              // Product image URL
        description: { type: String, default: "" }
      }
    ],
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
