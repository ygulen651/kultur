import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IBasin extends Document {
  title: string;
  summary?: string;
  imageUrl: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BasinSchema = new Schema<IBasin>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, unique: true, sparse: true, default: undefined },
  },
  { timestamps: true }
);

// slug otomatik
BasinSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.slug === "") this.slug = undefined as any;
  next();
});

export const Basin = mongoose.models.Basin || mongoose.model<IBasin>("Basin", BasinSchema);
