import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IGalleryItem extends Document {
  url: string;
  publicId: string;
  filename: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  folder: string;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryItemSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
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

// Sadece schema.index() kullan
GalleryItemSchema.index({ publicId: 1 });

export const GalleryItem = mongoose.models.GalleryItem || mongoose.model<IGalleryItem>('GalleryItem', GalleryItemSchema);
