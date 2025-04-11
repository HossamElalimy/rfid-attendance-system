import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0">
      <div className="container-fluid d-flex flex-column p-0">
        <Link
          className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0"
          to="/"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">Admin Panel</div>
        </Link>
        <hr className="sidebar-divider my-0" />
        <ul className="navbar-nav text-light" id="accordionSidebar">
          <li className={`nav-item ${location.pathname === "/admin/home" ? "active" : ""}`}>
            <Link className="nav-link" to="/admin/home">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={`nav-item ${location.pathname === "/admin/users" ? "active" : ""}`}>
            <Link className="nav-link" to="/admin/users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </Link>
          </li>
        </ul>
        <div className="text-center mt-auto mb-3">
          <button className="btn btn-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
