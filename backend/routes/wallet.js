const express = require("express");
const router = express.Router();
const Wallet = require("../models/Wallet");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

// 🔹 Get total balance across all wallets
router.get("/total", async (req, res) => {
  try {
    const wallets = await Wallet.find({});
    const totalBalance = wallets.reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
    res.json({ totalBalance: totalBalance.toFixed(2) });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute total wallet balance" });
  }
});

// 🔹 Get transactions for a wallet
router.get("/transactions/:walletId", async (req, res) => {
  try {
    const transactions = await Transaction.find({ walletID: req.params.walletId }).sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching transaction history" });
  }
});

// 🔹 Update wallet balance and save transaction
router.put("/:walletId", async (req, res) => {
  try {
    const { action, amount } = req.body;
    const numericAmount = Number(amount);

    if (!["add", "deduct"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ walletID: req.params.walletId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // Safe balance update
    if (action === "add") {
      wallet.balance += numericAmount;
    } else if (action === "deduct") {
      if (wallet.balance < numericAmount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      wallet.balance -= numericAmount;
    }

    await wallet.save();

    const txData = {
      transactionId: `TX${Date.now()}`,
      userId: req.body.userId,
      items: req.body.items || [],
      amount: numericAmount,
      action,
      walletID: wallet.walletID,
      balanceAfter: wallet.balance,
      timestamp: new Date()
    };
    
    if (action === "purchase") {
      txData.merchantId = req.body.merchantId;
      txData.merchantName = req.body.merchantName;
    }
    
    const transaction = new Transaction(txData);
    await transaction.save();
    const io = req.app.get("io");  // <-- Get io instance from app

// Emit real-time update
io.emit("walletUpdated", {
  walletID: wallet.walletID,
  userID: wallet.userID,
  balance: wallet.balance,
  amount: numericAmount,
  action,
  timestamp: txData.timestamp,
});

    



    res.json({ wallet, transaction });
  } catch (err) {
    console.error("Balance update error:", err);
    res.status(500).json({ error: "Error updating balance" });
  }
});

// 🔹 Get wallet by userID (_id)
router.get("/:userId", async (req, res) => {
  try {

    
    const wallet = await Wallet.findOne({ userID: req.params.userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    res.status(200).json({
      walletID: wallet.walletID,
      userID: wallet.userID,
      balance: wallet.balance,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching wallet" });
  }
});

// 🔹 Create wallet
router.post("/create", async (req, res) => {
  try {
    const user = await User.findById(req.body.userID);
    if (!user) return res.status(404).json({ error: "User not found" });

    const prefixMap = {
      student: "S", teacher: "T", admin: "A",
      merchant: "M", parent: "P", dean: "D",
      vice_dean: "V", secretary: "SC"
    };

    const prefix = prefixMap[user.role] || "U";
    const walletID = `${prefix}W${user.userId}`;

    const existing = await Wallet.findOne({ walletID });
    if (existing) return res.status(400).json({ error: "Wallet already exists" });

    const wallet = new Wallet({ walletID, userID: user._id, balance: 0 });
    await wallet.save();

    res.status(201).json(wallet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating wallet" });
  }
});

module.exports = router;
