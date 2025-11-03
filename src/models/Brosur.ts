import mongoose, { Schema, Document } from "mongoose";

export interface IBrosur extends Document {
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  category?: string;
  tags?: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrosurSchema = new Schema<IBrosur>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true,
      maxlength: 200
    },
    description: { 
      type: String, 
      trim: true,
      maxlength: 500
    },
    imageUrl: { 
      type: String, 
      required: true, 
      trim: true
    },
    imageAlt: { 
      type: String, 
      trim: true,
      maxlength: 100
    },
    category: { 
      type: String, 
      trim: true,
      default: 'Genel'
    },
    tags: [{ 
      type: String, 
      trim: true 
    }],
    isActive: { 
      type: Boolean, 
      default: true 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    timestamps: true 
  }
);

// Index'ler
BrosurSchema.index({ isActive: 1, order: 1 });
BrosurSchema.index({ category: 1 });
BrosurSchema.index({ tags: 1 });

export const Brosur = mongoose.models.Brosur || mongoose.model<IBrosur>("Brosur", BrosurSchema);
