import mongoose, { Schema, Document } from "mongoose";
import slugify from "slugify";

export interface IBrosur extends Document {
  title: string;
  summary?: string;
  imageUrl: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BrosurSchema = new Schema<IBrosur>(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    imageUrl: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: undefined },
  },
  { timestamps: true }
);

// slug otomatik
BrosurSchema.pre("validate", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  if (this.slug === "") this.slug = undefined as any;
  next();
});

// slug benzersiz
BrosurSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { slug: { $type: "string", $ne: "" } } }
);

export default mongoose.models.Brosur || mongoose.model<IBrosur>("Brosur", BrosurSchema);
