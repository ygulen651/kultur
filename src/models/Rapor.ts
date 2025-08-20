import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IRapor extends Document {
  title: string;
  summary?: string;
  imageUrl: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RaporSchema = new Schema<IRapor>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: undefined },
  },
  { timestamps: true }
);

// slug otomatik
RaporSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.slug === "") this.slug = undefined as any;
  next();
});

// slug benzersiz
RaporSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string", $ne: "" } } }
);

export default mongoose.models.Rapor || mongoose.model<IRapor>("Rapor", RaporSchema);
