import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  excerpt?: string;
  content?: string;
  imageFilename?: string;
  featuredImageUrl?: string;
  // Ek görseller için array
  images?: string[];
  // Ek dosyalar için array
  files?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>;
  fields?: {
    image?: {
      url?: string;
      publicId?: string;
      filename?: string;
    };
    [k: string]: any;
  };
  status: 'draft' | 'published' | 'archived';
  publishDate?: Date;
  featured: boolean;
  category?: string;
  author?: string;
  tags?: string[];
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
    // Ek görseller array'i
    images: [{ type: String }],
    // Ek dosyalar array'i
    files: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number }
    }],
    fields: {
      image: {
        url: { type: String, default: "" },
        publicId: { type: String, default: "" },
        filename: { type: String, default: "" },
      },
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishDate: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    category: { type: String, default: 'Genel' },
    author: { type: String, default: 'Anonim' },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

AnnouncementSchema.index({ createdAt: -1 });
AnnouncementSchema.index({ featured: 1, publishDate: -1 });
AnnouncementSchema.index({ status: 1 });

export const Announcement = (mongoose.models.Announcement as mongoose.Model<IAnnouncement>) ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
