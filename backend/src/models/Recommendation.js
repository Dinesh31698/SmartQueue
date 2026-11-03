const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    relatedProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    score: {
      type: Number,
      default: 1.0,
    },
    coOccurrenceCount: {
      type: Number,
      default: 1,
    },
    category: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

recommendationSchema.index({ productId: 1 }, { unique: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);
