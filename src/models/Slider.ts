import mongoose, { Schema, Document } from 'mongoose'

export interface ISlider extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string; // Vercel Blob URL
  imageFilename: string; // Dosya adı
  link?: string;
  buttonText?: string;
  buttonLink?: string;
  isActive: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
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
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Alt başlık en fazla 200 karakter olabilir']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Açıklama en fazla 500 karakter olabilir']
  },
  imageUrl: {
    type: String,
    required: [true, 'Görsel gereklidir']
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
  buttonText: {
    type: String,
    trim: true,
    maxlength: [50, 'Buton metni en fazla 50 karakter olabilir']
  },
  buttonLink: {
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
  backgroundColor: {
    type: String,
    default: '#000000'
  },
  textColor: {
    type: String,
    default: '#ffffff'
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
