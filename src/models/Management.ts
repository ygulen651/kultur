import mongoose, { Schema, Document } from 'mongoose'

export interface IManagement extends Document {
  group: string
  name: string
  position: string
  bio: string
  photo: string
  email: string
  phone: string
  experience: string
  education: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ManagementSchema = new Schema<IManagement>({
  group: {
    type: String,
    required: true,
    enum: ['yonetim-kurulu', 'merkez-yonetim-kurulu', 'merkez-denetleme-kurulu', 'merkez-disiplin-kurulu']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  photo: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  experience: {
    type: String,
    trim: true,
    default: ''
  },
  education: {
    type: String,
    trim: true,
    default: ''
  },
  order: {
    type: Number,
    default: 999
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Index'ler
ManagementSchema.index({ group: 1, order: 1 })
ManagementSchema.index({ group: 1, isActive: 1 })

export const Management = mongoose.models.Management || mongoose.model<IManagement>('Management', ManagementSchema)
