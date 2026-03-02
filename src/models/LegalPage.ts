import { Schema, Document, model } from 'mongoose';

export interface ILegalPage extends Document {
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  lastUpdatedAt: Date;
}

const LegalPageSchema = new Schema<ILegalPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    content: { type: String, required: true },
    isPublished: { type: Boolean, default: true },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

LegalPageSchema.index({ slug: 1 });

const LegalPage = model<ILegalPage>('LegalPage', LegalPageSchema);

export default LegalPage;

