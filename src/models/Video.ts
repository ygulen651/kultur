import mongoose, { Schema, Model } from "mongoose";

export interface IVideo {
  title: string;
  videoUrl: string; // YouTube embed URL
  thumbnailUrl?: string; // YouTube thumbnail
  youtubeId?: string; // YouTube video ID
  originalUrl?: string; // Orijinal YouTube URL
  cover?: { url: string };
  publishedAt?: Date;
  status?: string;
  slug?: string;
  createdAt?: Date;
}

const VideoSchema = new Schema<IVideo>({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, required: true, trim: true }, // YouTube embed URL
  thumbnailUrl: { type: String, trim: true }, // YouTube thumbnail
  youtubeId: { type: String, trim: true }, // YouTube video ID
  originalUrl: { type: String, trim: true }, // Orijinal YouTube URL
  cover: { url: String },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, default: "published" },
  slug: { type: String, trim: true, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

VideoSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  if (this.slug === "") this.slug = undefined as any;
  next();
});

export const Video = (mongoose.models.Video as Model<IVideo>) || mongoose.model<IVideo>("Video", VideoSchema);
