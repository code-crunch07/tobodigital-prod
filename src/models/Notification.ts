import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'order' | 'stock' | 'payment' | 'system' | 'other';
  relatedId?: mongoose.Types.ObjectId; // ID of related order, product, etc.
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
    },
    type: {
      type: String,
      enum: ['order', 'stock', 'payment', 'system', 'other'],
      default: 'other',
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      refPath: 'relatedModel',
    },
    relatedModel: {
      type: String,
      enum: ['Order', 'Product'],
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
NotificationSchema.index({ read: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);

