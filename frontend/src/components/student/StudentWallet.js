import React, { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import SocketContext from "../../contexts/SocketContext";

const StudentWallet = () => {
  const [transactions, setTransactions] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [filter, setFilter] = useState("");

  const [dateRange, setDateRange] = useState("");
const now = new Date();
const thisWeekStart = new Date(now);
thisWeekStart.setDate(now.getDate() - now.getDay());

const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

const dateFiltered = transactions.filter(tx => {
  const ts = new Date(tx.timestamp);
  if (dateRange === "thisweek") return ts >= thisWeekStart;
  if (dateRange === "thismonth") return ts >= thisMonthStart;
  return true;
});

const finalTransactions = dateFiltered.filter(tx => !filter || tx.action === filter);





  const socket = useContext(SocketContext);
  const summary = {
    totalTransactions: transactions.length,
    totalAdded: transactions.filter(t => t.action === "add").reduce((sum, t) => sum + t.amount, 0),
    totalDeducted: transactions.filter(t => t.action === "deduct").reduce((sum, t) => sum + t.amount, 0),
    totalPurchased: transactions.filter(t => t.action === "purchase").reduce((sum, t) => sum + t.amount, 0),
  };
  

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/transactions/user/${user.userId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error("Failed to load wallet transactions", err);
      }
    };
  
    fetchTransactions();
  
    if (socket) {
      socket.on("new-transaction", fetchTransactions);
    }
  
    return () => {
      if (socket) {
        socket.off("new-transaction", fetchTransactions);
      }
    };
  }, [socket, user.userId]);
  

  return (
    
    <div className="container mt-4">
        
      <h2>My Wallet Transactions</h2>
      <select className="form-select mb-3" onChange={(e) => setFilter(e.target.value)}>
  <option value="">All</option>
  <option value="add">Add</option>
  <option value="deduct">Deduct</option>
  <option value="purchase">Purchase</option>
</select>

<div className="row mb-3">
  <div className="col-md-3"><div className="card p-2 shadow-sm">💰 Total Added: <b>{summary.totalAdded}</b></div></div>
  <div className="col-md-3"><div className="card p-2 shadow-sm">🛒 Purchases: <b>{summary.totalPurchased}</b></div></div>
  <div className="col-md-3"><div className="card p-2 shadow-sm">➖ Deducted: <b>{summary.totalDeducted}</b></div></div>
  <div className="col-md-3"><div className="card p-2 shadow-sm">🧾 Total: <b>{summary.totalTransactions}</b></div></div>
</div>
<select className="form-select mb-3" onChange={(e) => setDateRange(e.target.value)}>
  <option value="">All Time</option>
  <option value="thisweek">This Week</option>
  <option value="thismonth">This Month</option>
</select>


      <table className="table table-bordered glassy-table mt-3">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Action</th>
            <th>Amount</th>
            <th>Merchant</th>
            <th>Items</th>
            <th>Date</th>
            <th>Time</th>
            <th>New Balance</th>
          </tr>
        </thead>
        <tbody>
  {finalTransactions.map((tx) => (
    <tr key={tx._id}>
      <td>{tx.transactionId}</td>
      <td>{tx.action}</td>
      <td>{tx.amount}</td>
      <td>{tx.merchantName || "-"}</td>
      <td>{tx.items?.join(", ") || "-"}</td>
      <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
      <td>{new Date(tx.timestamp).toLocaleTimeString()}</td>
      <td>{tx.balanceAfter !== undefined ? tx.balanceAfter : "N/A"}</td>

    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default StudentWallet;
