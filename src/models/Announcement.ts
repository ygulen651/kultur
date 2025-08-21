import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  excerpt?: string;
  content?: string;
  imageFilename?: string;
  featuredImageUrl?: string;
  fields?: {
    image?: {
      url?: string;
      publicId?: string;
      filename?: string;
    };
    [k: string]: any;
  };
  publishedAt?: Date;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    imageFilename: { type: String, default: "" },
    featuredImageUrl: { type: String, default: "" },
    fields: {
      image: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
        filename: { type: String, default: "" },
      },
    },
    publishedAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ isFeatured: 1, publishedAt: -1 });

export const Announcement = (mongoose.models.Announcement as mongoose.Model<IAnnouncement>) ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
