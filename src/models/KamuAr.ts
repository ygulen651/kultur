import mongoose, { Schema } from 'mongoose'

export interface IKamuAr extends mongoose.Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  images: string[]
  file: string
  fileName: string
  fileType: string
  category: string
  tags: string[]
  author: string
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  isActive: boolean
  publishDate: Date
  readTime: number
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

const KamuArSchema = new Schema<IKamuAr>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  file: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    default: 'Genel'
  },
  tags: {
    type: [String],
    default: []
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: Number,
    default: 5,
    min: 1
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Index'ler
KamuArSchema.index({ slug: 1 })
KamuArSchema.index({ status: 1, isActive: 1 })
KamuArSchema.index({ isFeatured: 1, publishDate: -1 })
KamuArSchema.index({ category: 1, publishDate: -1 })
KamuArSchema.index({ tags: 1 })
KamuArSchema.index({ publishDate: -1 })

export const KamuAr = mongoose.models.KamuAr || mongoose.model<IKamuAr>('KamuAr', KamuArSchema)
