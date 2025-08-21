import mongoose, { Schema } from 'mongoose'

export interface ITuzuk extends mongoose.Document {
  title: string
  content: string
  version: string
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  lastModifiedBy: string
  lastModifiedAt: Date
  createdAt: Date
  updatedAt: Date
}

const TuzukSchema = new Schema<ITuzuk>({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'Sendika Tüzüğü'
  },
  content: {
    type: String,
    required: true,
    default: ''
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
})

// Index'ler
TuzukSchema.index({ status: 1, isActive: 1 })
TuzukSchema.index({ createdAt: -1 })

export const TuzukModel = mongoose.models.Tuzuk || mongoose.model<ITuzuk>('Tuzuk', TuzukSchema)
