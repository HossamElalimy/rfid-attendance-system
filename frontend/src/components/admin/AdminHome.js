import React, { useEffect } from "react";

const AdminHome = () => {
  useEffect(() => {
    const chartScript = document.createElement("script");
    chartScript.src = "/assets/js/chart.min.js";
    chartScript.async = true;
    chartScript.onload = () => {
      if (window.Chart) {
        const lineCtx = document.getElementById("line-chart")?.getContext("2d");
        if (lineCtx) {
          new window.Chart(lineCtx, {
            type: "line",
            data: {
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
              datasets: [{
                label: "Purchases",
                data: [500, 1000, 750, 1250, 1500, 1750, 2000],
                borderColor: "#4e73df",
                backgroundColor: "rgba(78, 115, 223, 0.1)",
                fill: true,
                tension: 0.4
              }]
            }
          });
        }

        const pieCtx = document.getElementById("pie-chart")?.getContext("2d");
        if (pieCtx) {
          new window.Chart(pieCtx, {
            type: "doughnut",
            data: {
              labels: ["Books", "Recharges", "Drinks"],
              datasets: [{
                data: [55, 25, 20],
                backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc"]
              }]
            }
          });
        }
      }
    };
    document.body.appendChild(chartScript);
    return () => document.body.removeChild(chartScript);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div id="page-top">
      <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/assets/css/styles.min.css" />

      <div id="wrapper">
        {/* Sidebar */}
        <nav className="navbar navbar-dark align-items-start sidebar sidebar-dark accordion bg-gradient-primary p-0">
          <div className="container-fluid d-flex flex-column p-0">
            <a className="navbar-brand d-flex justify-content-center align-items-center sidebar-brand m-0" href="/">
              <div className="sidebar-brand-icon rotate-n-15"><i className="fas fa-laugh-wink"></i></div>
              <div className="sidebar-brand-text mx-3">Admin Panel</div>
            </a>
            <hr className="sidebar-divider my-0" />
            <ul className="navbar-nav text-light" id="accordionSidebar">
              <li className="nav-item"><a className="nav-link active" href="/"><i className="fas fa-tachometer-alt"></i><span>Dashboard</span></a></li>
              <li className="nav-item"><a className="nav-link" href="/admin/users"><i className="fas fa-users"></i><span>Users</span></a></li>
            </ul>
            <div className="text-center mt-auto mb-3">
              <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
            </div>
          </div>
        </nav>

        {/* Content Wrapper */}
        <div className="d-flex flex-column" id="content-wrapper">
          <div id="content">
            {/* Topbar */}
            <nav className="navbar navbar-light navbar-expand bg-white shadow mb-4 topbar static-top">
              <div className="container-fluid d-flex justify-content-between align-items-center">
                {/* Search */}
                <form className="d-none d-sm-inline-block form-inline ms-md-3 my-2 my-md-0 mw-100 navbar-search">
                  <div className="input-group">
                    <input type="text" className="form-control bg-light border-0 small" placeholder="Search for ..." />
                    <button className="btn btn-primary" type="button"><i className="fas fa-search fa-sm"></i></button>
                  </div>
                </form>

                {/* Icons + Profile Dropdown */}
                <div className="d-flex align-items-center gap-3">
                  {/* Alerts */}
                  <div className="dropdown">
                    <div className="position-relative dropdown-toggle" role="button" data-bs-toggle="dropdown">
                      <i className="fas fa-bell fa-lg text-secondary"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">3+</span>
                    </div>
                    <div className="dropdown-menu dropdown-menu-end shadow p-2">
                      <h6 className="dropdown-header text-primary">Alerts</h6>
                      <a className="dropdown-item small">📢 New monthly report</a>
                      <a className="dropdown-item small">💰 Deposit confirmed</a>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="dropdown">
                    <div className="position-relative dropdown-toggle" role="button" data-bs-toggle="dropdown">
                      <i className="fas fa-envelope fa-lg text-secondary"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">7</span>
                    </div>
                    <div className="dropdown-menu dropdown-menu-end shadow p-2">
                      <h6 className="dropdown-header text-primary">Messages</h6>
                      <a className="dropdown-item small"><strong>Emily</strong>: Hi! Just checking...</a>
                      <a className="dropdown-item small"><strong>Ali</strong>: Got it, thanks!</a>
                    </div>
                  </div>

                  <div className="vr mx-2"></div>

                  {/* Profile */}
                  <div className="dropdown">
                    <div className="dropdown-toggle d-flex align-items-center" role="button" data-bs-toggle="dropdown">
                      <span className="text-gray-600 small me-2">Hossam Mohamed</span>
                      <img className="img-profile rounded-circle" src="/assets/img/avatars/avatar3.jpeg" alt="profile" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                    </div>
                    <div className="dropdown-menu dropdown-menu-end shadow">
                      <a className="dropdown-item"><i className="fas fa-user fa-sm fa-fw me-2 text-gray-400"></i> Profile</a>
                      <a className="dropdown-item"><i className="fas fa-cogs fa-sm fa-fw me-2 text-gray-400"></i> Settings</a>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item text-danger" onClick={logout}><i className="fas fa-sign-out-alt fa-sm fa-fw me-2 text-gray-400"></i> Logout</button>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            {/* Main Content */}
            <div className="container-fluid">
              <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark mb-0">Dashboard</h3>
                <a className="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="/"><i className="fas fa-download fa-sm text-white-50"></i>&nbsp;Generate Report</a>
              </div>
              <div className="row">
  {/* 1. Balance */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-primary py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-primary fw-bold text-xs mb-1">Balance</div>
            <div className="text-dark fw-bold h5 mb-0">$40,000</div>
          </div>
          <div className="col-auto"><i className="fas fa-wallet fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 2. Total Purchased */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-success py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-success fw-bold text-xs mb-1">Total Purchased</div>
            <div className="text-dark fw-bold h5 mb-0">$-215,000</div>
          </div>
          <div className="col-auto"><i className="fas fa-dollar-sign fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 3. Attendance */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-info py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-info fw-bold text-xs mb-1">Attendance</div>
            <div className="row g-0 align-items-center">
              <div className="col-auto">
                <div className="text-dark fw-bold h5 mb-0 me-3">50%</div>
              </div>
              <div className="col">
                <div className="progress progress-sm">
                  <div className="progress-bar bg-info" style={{ width: "50%" }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-auto"><i className="fas fa-calendar-check fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 4. Total Lectures */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-warning py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-warning fw-bold text-xs mb-1">Total Lectures</div>
            <div className="text-dark fw-bold h5 mb-0">18</div>
          </div>
          <div className="col-auto"><i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 5. Total Students */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-primary py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-primary fw-bold text-xs mb-1">Total Students</div>
            <div className="text-dark fw-bold h5 mb-0">120</div>
          </div>
          <div className="col-auto"><i className="fas fa-user-graduate fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 6. Total Teachers */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-success py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-success fw-bold text-xs mb-1">Total Teachers</div>
            <div className="text-dark fw-bold h5 mb-0">20</div>
          </div>
          <div className="col-auto"><i className="fas fa-chalkboard-teacher fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>

  {/* 7. Transactions Today */}
  <div className="col-md-6 col-xl-3 mb-4">
    <div className="card shadow border-start-info py-2">
      <div className="card-body">
        <div className="row align-items-center no-gutters">
          <div className="col me-2">
            <div className="text-uppercase text-info fw-bold text-xs mb-1">Transactions Today</div>
            <div className="text-dark fw-bold h5 mb-0">53</div>
          </div>
          <div className="col-auto"><i className="fas fa-credit-card fa-2x text-gray-300"></i></div>
        </div>
      </div>
    </div>
  </div>
</div>

              {/* 📈 Chart Section */}
              <div className="row">
                <div className="col-lg-6 col-xl-8">
                  <div className="card shadow mb-4">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                      <h6 className="text-primary fw-bold m-0">Purchase History Overview</h6>
                    </div>
                    <div className="card-body">
                      <canvas id="line-chart" width="100%" height="40"></canvas>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-xl-4">
                  <div className="card shadow mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h6 className="text-primary fw-bold m-0">Purchases</h6>
                    </div>
                    <div className="card-body">
                      <canvas id="pie-chart" width="100%" height="100"></canvas>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ Attendance Status Section */}
              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 fw-bold text-primary">Attendance Status</h6>
                </div>
                <div className="card-body">
                  {[
                    { label: "CS101", percent: 30, color: "danger" },
                    { label: "CS201", percent: 50, color: "warning" },
                    { label: "CS301", percent: 70, color: "primary" },
                    { label: "CS401", percent: 90, color: "info" },
                    { label: "Grad Project", percent: 100, color: "success" }
                  ].map((item, i) => (
                    <div className="mb-3" key={i}>
                      <span>{item.label}</span>
                      <div className="progress">
                        <div className={`progress-bar bg-${item.color}`} style={{ width: `${item.percent}%` }}>
                          {item.percent === 100 ? "Complete!" : `${item.percent}%`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🎨 Restyled Color Cards */}
              <div className="row">
                {[
                  { name: "Primary", color: "primary" },
                  { name: "Success", color: "success" },
                  { name: "Info", color: "info" },
                  { name: "Warning", color: "warning" },
                  { name: "Danger", color: "danger" },
                  { name: "Secondary", color: "secondary" }
                ].map((card, i) => (
                  <div className="col-md-4 mb-4" key={i}>
                    <div className={`card text-white bg-${card.color} shadow`}>
                      <div className="card-body">
                        {card.name}
                        <div className="text-white-50 small">#{card.color}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div> {/* End container-fluid */}
          </div> {/* End content */}
        </div> {/* End content-wrapper */}
      </div> {/* End wrapper */}
    </div> // End page-top
  );
};

export default AdminHome;
