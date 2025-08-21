import mongoose, { Schema, model, models } from "mongoose";

export interface IPressImage {
  url: string;
  publicId?: string;
  filename?: string;
  width?: number;
  height?: number;
}

export interface IPressPost extends mongoose.Document {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status: "draft" | "published";
  publishedAt?: Date;
  url?: string;
  image: IPressImage;      // kapak
  gallery: IPressImage[];  // ek görseller
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IPressImage>({
  url: { type: String, default: "" },
  publicId: String,
  filename: String,
  width: Number,
  height: Number,
}, { _id: false });

const PressPostSchema = new Schema<IPressPost>({
  title: { type: String, required: true, trim: true },
  slug:  { type: String, required: true, unique: true, index: true },
  excerpt: String,
  content: String,
  category: { type: String, default: "Genel" },
  status:   { type: String, enum: ["draft","published"], default: "published", index: true },
  publishedAt: { type: Date, default: Date.now },
  url: String,
  image:  { type: ImageSchema, default: () => ({ url: "" }) },
  gallery:{ type: [ImageSchema], default: [] },
}, { timestamps: true });

export const PressPost = models.PressPost || model<IPressPost>("PressPost", PressPostSchema);
