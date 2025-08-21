import mongoose, { Schema, Document } from 'mongoose'

export interface ISlider extends Document {
  title: string;
  imageFilename: string;
  link?: string;
  isActive: boolean;
  order: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SliderSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Başlık gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık en fazla 100 karakter olabilir']
  },
  imageFilename: {
    type: String,
    default: "",
    required: true
  },
  link: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  publishedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

SliderSchema.index({ order: 1 });
SliderSchema.index({ isActive: 1 });
SliderSchema.index({ createdAt: -1 });

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);
