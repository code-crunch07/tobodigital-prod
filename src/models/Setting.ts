import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettingValue {
  siteName?: string;
  siteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  currency?: string;
  timezone?: string;
  logo?: string;
  favicon?: string;
}

export interface ISetting extends Document {
  key: string;
  value: Record<string, unknown>;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.model<ISetting>('Setting', SettingSchema);
