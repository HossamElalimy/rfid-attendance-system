const mongoose = require('mongoose');

// Define the Wallet schema
const WalletSchema = new mongoose.Schema({
  walletID: {
    type: String,
    required: true,
    unique: true,
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // This will reference the User model
    required: true,
  },
  balance: {
    type: Number,
    default: 0,  // Default balance is 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Wallet', WalletSchema);
