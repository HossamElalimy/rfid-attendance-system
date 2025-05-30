// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminHome from "./components/admin/AdminHome";
import AdminLayout from "./components/admin/AdminLayout";
import AdminUsers from "./components/admin/AdminUsers";
import SessionManager from "./components/SessionManager";
import AdminCourses from "./components/admin/AdminCourses";
import AdminCoursesList from "./components/admin/AdminCourseList";
import AdminTransactions from "./components/admin/AdminTransactions";
import AdminLectures from "./components/admin/AdminLectures";

function App() {
  return (
    <Router>
      <SessionManager />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="home" element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCoursesList />} />
          <Route path="courses/create" element={<AdminCourses />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="lectures" element={<AdminLectures />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
