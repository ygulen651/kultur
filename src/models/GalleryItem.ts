import { Schema, model, models } from "mongoose";

const GalleryItemSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true, index: true },
    filename: { type: String, default: "" },
    format: { type: String, default: "" },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    bytes: { type: Number, default: 0 },
    resourceType: { type: String, default: "image" },
    folder: { type: String, default: "sendika/gallery" }
  },
  { timestamps: true }
);

const GalleryItem = models.GalleryItem || model("GalleryItem", GalleryItemSchema);
export default GalleryItem;
