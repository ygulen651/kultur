import mongoose, { Schema } from 'mongoose'

export interface IDocument extends mongoose.Document {
  title: string
  description: string
  category: string
  tags: string[]
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  mimeType: string
  status: 'published' | 'draft' | 'archived'
  isPrivate: boolean
  isActive: boolean
  downloadCount: number
  uploadedBy: string
  order: number
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Resmi Belgeler', 'Şablonlar', 'Formlar', 'Yönetim', 'Hukuki', 'Eğitim', 'Diğer']
  },
  tags: [{
    type: String,
    trim: true
  }],
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published'
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 999
  }
}, {
  timestamps: true
})

// Index'ler
DocumentSchema.index({ category: 1, status: 1, isActive: 1 })
DocumentSchema.index({ tags: 1 })
DocumentSchema.index({ title: 'text', description: 'text' })
DocumentSchema.index({ order: 1, createdAt: -1 })

export const DocumentModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema)


