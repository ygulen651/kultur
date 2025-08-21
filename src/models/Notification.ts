import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  recipients: 'all' | 'members' | 'admins' | 'custom'
  channels: string[]
  scheduledFor?: Date
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  createdAt: Date
  sentAt?: Date
  recipientCount?: number
  openRate?: number
  emailSubject?: string
  emailTemplate?: string
  emailRecipients?: string
}

const NotificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: [true, 'Başlık zorunludur'],
    trim: true,
    maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
  },
  message: {
    type: String,
    required: [true, 'Mesaj zorunludur'],
    trim: true,
    maxlength: [2000, 'Mesaj 2000 karakterden uzun olamaz']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  recipients: {
    type: String,
    enum: ['all', 'members', 'admins', 'custom'],
    default: 'all'
  },
  channels: [{
    type: String,
    enum: ['web', 'email', 'sms'],
    default: ['web']
  }],
  scheduledFor: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date,
    default: null
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  openRate: {
    type: Number,
    default: 0,
    min: [0, 'Açılma oranı 0\'dan küçük olamaz'],
    max: [100, 'Açılma oranı 100\'den büyük olamaz']
  },
  emailSubject: {
    type: String,
    trim: true,
    maxlength: [200, 'E-posta konusu 200 karakterden uzun olamaz']
  },
  emailTemplate: {
    type: String,
    trim: true,
    maxlength: [10000, 'E-posta şablonu 10000 karakterden uzun olamaz']
  },
  emailRecipients: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index'ler
NotificationSchema.index({ status: 1, createdAt: -1 })
NotificationSchema.index({ scheduledFor: 1, status: 1 })
NotificationSchema.index({ recipients: 1 })
NotificationSchema.index({ channels: 1 })

// Virtual alanlar
NotificationSchema.virtual('isScheduled').get(function() {
  return this.status === 'scheduled' && this.scheduledFor && this.scheduledFor > new Date()
})

NotificationSchema.virtual('isOverdue').get(function() {
  return this.status === 'scheduled' && this.scheduledFor && this.scheduledFor < new Date()
})

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  // Eğer durum 'sent' olarak değiştirilirse sentAt'i güncelle
  if (this.isModified('status') && this.status === 'sent' && !this.sentAt) {
    this.sentAt = new Date()
  }
  
  // Eğer zamanlanan tarih geçmişse durumu 'failed' yap
  if (this.scheduledFor && this.scheduledFor < new Date() && this.status === 'scheduled') {
    this.status = 'failed'
  }
  
  next()
})

// Statik metodlar
NotificationSchema.statics.getStats = async function() {
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
    sent: 0,
    scheduled: 0,
    draft: 0,
    failed: 0
  }
  
  stats.forEach(stat => {
    result[stat._id] = stat.count
    result.total += stat.count
  })
  
  return result
}

// Instance metodlar
NotificationSchema.methods.markAsSent = async function() {
  this.status = 'sent'
  this.sentAt = new Date()
  return await this.save()
}

NotificationSchema.methods.schedule = async function(scheduledFor: Date) {
  this.status = 'scheduled'
  this.scheduledFor = scheduledFor
  return await this.save()
}

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
