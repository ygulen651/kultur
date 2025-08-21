import mongoose, { Schema, Model } from "mongoose";
export interface IVideo {
  title: string;
  videoUrl: string;
  cover?: { url: string };
  publishedAt?: Date;
  status?: string;
  slug?: string;
}
const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  cover: { url: String },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, default: "published" },
  slug: { type: String, trim: true },
}, { timestamps: true });

VideoSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string", $ne: "" } } }
);

export const Video = (mongoose.models.Video as Model<IVideo>) || mongoose.model<IVideo>("Video", VideoSchema);
