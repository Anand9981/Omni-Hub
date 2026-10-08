import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    subscription_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    invoice_number: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['paid', 'open', 'void', 'uncollectible'],
      default: 'paid',
    },
    invoice_pdf_url: {
      type: String,
    },
    paid_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  },
);

export const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
