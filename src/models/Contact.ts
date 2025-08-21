import mongoose, { Schema, Document } from 'mongoose'

export interface IContact extends Document {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  company?: string
  status: 'new' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: Date
  readAt?: Date
  repliedAt?: Date
  adminNotes?: string
  ipAddress?: string
  userAgent?: string
}

const ContactSchema = new Schema<IContact>({
  name: {
    type: String,
    required: [true, 'İsim zorunludur'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta zorunludur'],
    trim: true,
    lowercase: true,
    maxlength: [200, 'E-posta 200 karakterden uzun olamaz']
  },
  subject: {
    type: String,
    required: [true, 'Konu zorunludur'],
    trim: true,
    maxlength: [200, 'Konu 200 karakterden uzun olamaz']
  },
  message: {
    type: String,
    required: [true, 'Mesaj zorunludur'],
    trim: true,
    maxlength: [2000, 'Mesaj 2000 karakterden uzun olamaz']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Telefon 20 karakterden uzun olamaz']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Şirket adı 100 karakterden uzun olamaz']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  readAt: {
    type: Date,
    default: null
  },
  repliedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notları 1000 karakterden uzun olamaz']
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index'ler
ContactSchema.index({ status: 1, createdAt: -1 })
ContactSchema.index({ priority: 1, createdAt: -1 })
ContactSchema.index({ email: 1 })
ContactSchema.index({ createdAt: -1 })

// Virtual alanlar
ContactSchema.virtual('isNew').get(function() {
  return this.status === 'new'
})

ContactSchema.virtual('isRead').get(function() {
  return this.status === 'read' || this.status === 'replied'
})

ContactSchema.virtual('isReplied').get(function() {
  return this.status === 'replied'
})

ContactSchema.virtual('ageInHours').get(function() {
  const now = new Date()
  const created = this.createdAt
  const diffInMs = now.getTime() - created.getTime()
  return Math.floor(diffInMs / (1000 * 60 * 60))
})

// Pre-save middleware
ContactSchema.pre('save', function(next) {
  // Eğer durum 'read' olarak değiştirilirse readAt'i güncelle
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date()
  }
  
  // Eğer durum 'replied' olarak değiştirilirse repliedAt'i güncelle
  if (this.isModified('status') && this.status === 'replied' && !this.repliedAt) {
    this.repliedAt = new Date()
  }
  
  next()
})

// Statik metodlar
ContactSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ])
  
  const result = {
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    archived: 0
  }
  
  stats.forEach(stat => {
    result[stat._id] = stat.count
    result.total += stat.count
  })
  
  return result
}

ContactSchema.statics.getPriorityStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ])
  
  const result = {
    low: 0,
    normal: 0,
    high: 0,
    urgent: 0
  }
  
  stats.forEach(stat => {
    result[stat._id] = stat.count
  })
  
  return result
}

// Instance metodlar
ContactSchema.methods.markAsRead = async function() {
  this.status = 'read'
  this.readAt = new Date()
  return await this.save()
}

ContactSchema.methods.markAsReplied = async function() {
  this.status = 'replied'
  this.repliedAt = new Date()
  return await this.save()
}

ContactSchema.methods.archive = async function() {
  this.status = 'archived'
  return await this.save()
}

export const Contact = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)
