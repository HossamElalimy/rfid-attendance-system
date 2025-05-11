const express = require('express');
const router = express.Router();
const Wallet = require('../models/Wallet');
const User = require('../models/User');

// Helper: Generate walletID starting with W01, W02, ...
async function generateWalletID() {
  const count = await Wallet.countDocuments();  // Count total existing wallets
  const number = (count + 1).toString().padStart(2, "0"); // e.g., W01, W02
  return "W" + number;  // Return walletID, e.g., W01
}

// Create a wallet for the user
router.post("/create", async (req, res) => {
  const { userID } = req.body;  // userID from request body
  
  try {
    // Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ userID });

    if (existingWallet) {
      return res.status(400).json({ message: "Wallet already exists for this user" });
    }

    // Generate walletID and create new wallet
    const walletID = await generateWalletID();
    const newWallet = new Wallet({
      walletID,
      userID,
      balance: 0,  // Default balance is 0
    });

    await newWallet.save();

    // Update user's walletID field
    await User.findByIdAndUpdate(userID, { walletID: newWallet._id });

    res.status(201).json(newWallet);  // Return the created wallet
  } catch (err) {
    res.status(500).json({ error: "Error creating wallet" });
  }
});

// Fetch wallet info
router.get("/:userID", async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userID: req.params.userID });

    if (!wallet) {
      return res.status(404).json({ message: "No wallet found for this user" });
    }

    res.json(wallet);  // Return wallet info
  } catch (err) {
    res.status(500).json({ error: "Error fetching wallet info" });
  }
});

// Update wallet balance (Add or Deduct)
router.put("/:walletID", async (req, res) => {
  const { action, amount } = req.body;  // action: 'add' or 'deduct'

  try {
    const wallet = await Wallet.findOne({ walletID: req.params.walletID });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Perform action: Add or Deduct balance
    if (action === "add") {
      wallet.balance += amount;
    } else if (action === "deduct") {
      if (wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      wallet.balance -= amount;
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await wallet.save();
    res.json(wallet);  // Return updated wallet
  } catch (err) {
    res.status(500).json({ error: "Error updating wallet" });
  }
});

module.exports = router;
