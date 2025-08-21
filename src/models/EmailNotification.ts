import mongoose, { Schema, Document } from 'mongoose'

export interface IEmailNotification extends Document {
  title: string
  message: string
  emailSubject: string
  emailRecipients: string[]
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  recipients: number
  opened: number
  clicked: number
  scheduledFor?: Date
  sentAt?: Date
  failedAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  template?: string
  attachments?: string[]
  metadata?: Record<string, any>
}

const EmailNotificationSchema = new Schema<IEmailNotification>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  emailSubject: {
    type: String,
    required: true,
    trim: true
  },
  emailRecipients: [{
    type: String,
    required: true,
    trim: true
  }],
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  recipients: {
    type: Number,
    default: 0
  },
  opened: {
    type: Number,
    default: 0
  },
  clicked: {
    type: Number,
    default: 0
  },
  scheduledFor: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  failedAt: {
    type: Date
  },
  createdBy: {
    type: String,
    required: true
  },
  template: {
    type: String
  },
  attachments: [{
    type: String
  }],
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
})

// Indexes
EmailNotificationSchema.index({ status: 1, createdAt: -1 })
EmailNotificationSchema.index({ scheduledFor: 1, status: 1 })
EmailNotificationSchema.index({ type: 1, createdAt: -1 })
EmailNotificationSchema.index({ createdBy: 1, createdAt: -1 })

export default mongoose.models.EmailNotification || mongoose.model<IEmailNotification>('EmailNotification', EmailNotificationSchema)
