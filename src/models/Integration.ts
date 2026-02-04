import mongoose, { Document, Schema } from 'mongoose';

export interface IIntegration extends Document {
  name: string;
  type: 'Payment' | 'Shipping' | 'Email';
  status: 'connected' | 'disconnected';
  apiKey?: string; // stored plain for demo; use encryption in production
  config?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['Payment', 'Shipping', 'Email'], required: true },
    status: { type: String, enum: ['connected', 'disconnected'], default: 'disconnected' },
    apiKey: { type: String, default: '' },
    config: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<IIntegration>('Integration', IntegrationSchema);
