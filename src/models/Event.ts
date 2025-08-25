import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  excerpt?: string;
  content?: string;
  location?: string;
  date?: Date;           // MongoDB'deki mevcut field
  startDate?: Date;      // Yeni field (opsiyonel)
  endDate?: Date;
  time?: string;         // MongoDB'deki mevcut field
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  category?: string;
  cover?: string;        // MongoDB'deki mevcut field
  image?: { url?: string; publicId?: string; filename?: string };
  publishedAt?: Date;    // Yayınlanma tarihi
  createdBy?: string;    // MongoDB'deki mevcut field
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    location: { type: String, default: "" },
    date: { type: Date },           // MongoDB'deki mevcut field
    startDate: { type: Date },      // Yeni field (opsiyonel)
    endDate: { type: Date },
    time: { type: String, default: "" },  // MongoDB'deki mevcut field
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    featured: { type: Boolean, default: false },
    category: { type: String, default: 'Genel' },
    publishedAt: { type: Date },           // Yayınlanma tarihi
    cover: { type: String, default: "" },  // MongoDB'deki mevcut field
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      filename: { type: String, default: "" },
    },
    createdBy: { type: String, default: "" },  // MongoDB'deki mevcut field
  },
  { timestamps: true }
);

EventSchema.index({ startDate: -1 });
EventSchema.index({ featured: 1 });
EventSchema.index({ status: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
