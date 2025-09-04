import mongoose, { Document, Schema } from 'mongoose';

export interface IBuyukSlider extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  imageFilename: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
  order: number;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BuyukSliderSchema = new Schema<IBuyukSlider>({
  title: {
    type: String,
    required: [true, 'Başlık gerekli'],
    trim: true,
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Alt başlık en fazla 300 karakter olabilir']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Açıklama en fazla 1000 karakter olabilir']
  },
  imageUrl: {
    type: String,
    required: [true, 'Görsel URL gerekli'],
    trim: true
  },
  imageFilename: {
    type: String,
    trim: true
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
  order: {
    type: Number,
    default: 1,
    min: [1, 'Sıra en az 1 olabilir']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  backgroundColor: {
    type: String,
    default: '#000000',
    match: [/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu girin']
  },
  textColor: {
    type: String,
    default: '#ffffff',
    match: [/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu girin']
  },
  createdBy: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better performance
BuyukSliderSchema.index({ order: 1, isActive: 1 });
BuyukSliderSchema.index({ createdAt: -1 });

export const BuyukSlider = mongoose.models.BuyukSlider || mongoose.model<IBuyukSlider>('BuyukSlider', BuyukSliderSchema);
