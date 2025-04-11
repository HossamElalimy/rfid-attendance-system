import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminHome from "./components/admin/AdminHome";
import AdminLayout from "./components/admin/AdminLayout";
import UserManagement from "./components/admin/UserManagement";
import AdminUsers from "./components/admin/AdminUsers"; // ✅ New import

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin main layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="home" element={<AdminHome />} />
          {/* <Route path="users" element={<UserManagement />} /> */}
          <Route path="/admin/users" element={<AdminUsers />} /> {/* ✅ New route */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
