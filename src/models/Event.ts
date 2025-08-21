import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEvent extends Document {
  title: string;
  excerpt?: string;
  content?: string;
  location?: string;
  startAt: Date;
  endAt?: Date;
  isFeatured: boolean;
  publishedAt?: Date;
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
    startAt: { type: Date, required: true },
    endAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      filename: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

EventSchema.index({ startAt: -1 });
EventSchema.index({ isFeatured: 1 });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
