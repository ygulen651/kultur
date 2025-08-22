import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  excerpt?: string;
  content?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  category?: string;
  image?: { url?: string; publicId?: string; filename?: string };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    featured: { type: Boolean, default: false },
    category: { type: String, default: 'Genel' },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      filename: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

EventSchema.index({ startDate: -1 });
EventSchema.index({ featured: 1 });
EventSchema.index({ status: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
