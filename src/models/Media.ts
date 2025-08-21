import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  title: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  category?: string;
  tags: string[];
  uploadDate: Date;
  size?: string;
  width?: number;
  height?: number;
}

const MediaSchema = new Schema<IMedia>(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    category: { type: String, default: "" },
    tags: { type: [String], default: [] },
    uploadDate: { type: Date, default: Date.now },
    size: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  { timestamps: true }
);

export const Media = (mongoose.models.Media as mongoose.Model<IMedia>) ||
  mongoose.model<IMedia>('Media', MediaSchema);

