import React from "react";

const Topbar = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-light navbar-expand bg-white shadow mb-4 topbar static-top">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* 🔍 Search */}
        <form className="d-none d-sm-inline-block form-inline ms-md-3 my-2 my-md-0 mw-100 navbar-search">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-light border-0 small"
              placeholder="Search for ..."
            />
            <button className="btn btn-primary" type="button">
              <i className="fas fa-search fa-sm"></i>
            </button>
          </div>
        </form>

        {/* 🔔 ✉️ 👤 Icons & Profile */}
        <div className="d-flex align-items-center gap-3">
          {/* Bell icon with badge */}
          <div className="dropdown">
            <div
              className="position-relative dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-bell fa-lg text-secondary"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3+
              </span>
            </div>
            <div className="dropdown-menu dropdown-menu-end shadow p-2">
              <h6 className="dropdown-header text-primary">Alerts</h6>
              <a className="dropdown-item small">📢 New monthly report</a>
              <a className="dropdown-item small">💰 Deposit confirmed</a>
            </div>
          </div>

          {/* Messages */}
          <div className="dropdown">
            <div
              className="position-relative dropdown-toggle"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i className="fas fa-envelope fa-lg text-secondary"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                7
              </span>
            </div>
            <div className="dropdown-menu dropdown-menu-end shadow p-2">
              <h6 className="dropdown-header text-primary">Messages</h6>
              <a className="dropdown-item small">
                <strong>Emily</strong>: Hi! Just checking...
              </a>
              <a className="dropdown-item small">
                <strong>Ali</strong>: Got it, thanks!
              </a>
            </div>
          </div>

          <div className="vr mx-2"></div>

          {/* Profile */}
          <div className="dropdown">
            <div
              className="dropdown-toggle d-flex align-items-center"
              role="button"
              data-bs-toggle="dropdown"
            >
              <span className="text-gray-600 small me-2">Hossam Mohamed</span>
              <img
                className="img-profile rounded-circle"
                src="/assets/img/avatars/avatar3.jpeg"
                alt="profile"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
            </div>
            <div className="dropdown-menu dropdown-menu-end shadow">
              <a className="dropdown-item">
                <i className="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i> Profile
              </a>
              <a className="dropdown-item">
                <i className="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i> Settings
              </a>
              <div className="dropdown-divider" />
              <button className="dropdown-item text-danger" onClick={logout}>
                <i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
