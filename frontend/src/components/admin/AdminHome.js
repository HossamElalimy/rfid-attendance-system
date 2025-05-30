import React, { useEffect,useRef, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import axios from "axios";
const rawUser = localStorage.getItem("user");
const user = rawUser ? JSON.parse(rawUser) : null;
console.log("Parsed user from localStorage:", user);



const AdminHome = () => {
  
  const [summary, setSummary] = useState({});
  const [myWallet, setMyWallet] = useState(null);
  const purchaseChartRef = useRef(null);



  
  useEffect(() => {
    // 🔄 Fetch summary every 5s
    const fetchSummary = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/dashboard/summary");
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };
    const fetchMyWallet = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/wallet/${user._id}`);

        if (res.data.message === "No wallet") {
          setMyWallet(null);
        } else {
          setMyWallet(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch wallet", err);
        setMyWallet(null);
      }
      
    };
    
    fetchMyWallet();
    
  
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
  
    // 📊 Load Chart.js and render charts
    const chartScript = document.createElement("script");
    chartScript.src = "/assets/js/chart.min.js";
    chartScript.async = true;
    
    
    
  
    document.body.appendChild(chartScript);
  
    return () => {
      clearInterval(interval);
      if (purchaseChartRef.current) {
        purchaseChartRef.current.destroy();
      }
      
      document.body.removeChild(chartScript);
    };
    
  }, []);
  
  useEffect(() => {
    if (!window.Chart || !summary?.monthlyPurchases || summary.monthlyPurchases.length !== 12) {
      console.warn("⏳ Chart not ready — waiting for data...");
      return;
    }
  
    const ctx = document.getElementById("purchaseChart")?.getContext("2d");
    if (!ctx) {
      console.error("❌ Could not find canvas element with id 'purchaseChart'");
      return;
    }
  
    if (purchaseChartRef.current) {
      purchaseChartRef.current.destroy();
    }
  
    purchaseChartRef.current = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [{
          label: "Monthly Purchase ($)",
          data: summary.monthlyPurchases,
          backgroundColor: "rgba(78, 115, 223, 0.5)",
          borderColor: "#4e73df",
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }, [summary]);
  
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };


  const StatCard = ({ label, value, icon, color, progress }) => (
    <div className="col-md-6 col-xl-3 mb-4">
      <div className={`card shadow border-start-${color} py-2`}>
        <div className="card-body">
          <div className="row align-items-center no-gutters">
            <div className="col me-2">
              <div className={`text-uppercase text-${color} fw-bold text-xs mb-1`}>{label}</div>
              {progress !== undefined ? (
                <div className="row g-0 align-items-center">
                  <div className="col-auto">
                    <div className="text-dark fw-bold h5 mb-0 me-3">{value}</div>
                  </div>
                  <div className="col">
                    <div className="progress progress-sm">
                      <div className={`progress-bar bg-${color}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-dark fw-bold h5 mb-0">{value}</div>
              )}
            </div>
            <div className="col-auto">
              <i className={`fas ${icon} fa-2x text-gray-300`}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  

  return (
    <div id="page-top">
      <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/assets/css/styles.min.css" />

      <div id="wrapper">
        {/* Sidebar */}
        <Sidebar />


        {/* Content Wrapper */}
        <div className="d-flex flex-column" id="content-wrapper">
          <div id="content">
            {/* Topbar */}
           <Topbar />

            {/* Main Content */}
            <div className="container-fluid">
              <div className="d-sm-flex justify-content-between align-items-center mb-4">
                <h3 className="text-dark mb-0"> Dashboard</h3>
                <a className="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="/"><i className="fas fa-download fa-sm text-white-50"></i>&nbsp;Generate Report</a>
              </div>


{/* ✅ Row 1 */}
<div className="row">
<StatCard
  label="My Wallet Balance"
  value={
    myWallet
      ? `$${myWallet.balance?.toLocaleString() || 0}`
      : "You Don't Have Wallet"
  }
  icon="fa-wallet"
  color={myWallet ? "primary" : "danger"}
/>

<StatCard label="Total Wallets" value={summary.totalWallets || 0} icon="fa-wallet" color="primary" />
<StatCard label="Total Wallets Balance" value={`$${summary.totalWalletAmount?.toLocaleString() || 0}`} icon="fa-money-bill" color="success" />
 
  <StatCard label="Total Purchased" value={`$${summary.totalPurchased?.toLocaleString() || 0}`} icon="fa-hand-holding-usd" color="dark" />

 
 
 

</div>

{/* ✅ Row 2 */}
<div className="row">
<StatCard
  label="Total Transactions"
  value={summary.totalTransactions || 0}
  icon="fa-receipt"
  color="primary"
/>
<StatCard label="Transactions Today" value={summary.transactionsToday || 0} icon="fa-credit-card" color="info" />
<StatCard label="Purchased Today" value={`$${summary.purchasedToday?.toLocaleString() || 0}`} icon="fa-minus-circle" color="danger" />

  <StatCard label="Total Admins" value={summary.totalAdmins || 0} icon="fa-user-shield" color="primary" />
 
 
 
 
</div>

{/* ✅ Row 3 */}
<div className="row">
<StatCard label="Total Deans" value={summary.totalDeans || 0} icon="fa-user-tie" color="success" />
<StatCard label="Total Vice Deans" value={summary.totalViceDeans || 0} icon="fa-user-tie" color="info" />
<StatCard label="Total Teachers" value={summary.totalTeachers || 0} icon="fa-chalkboard-teacher" color="success" />
<StatCard label="Total Secretaries" value={summary.totalSecretaries || 0} icon="fa-user-secret" color="danger" />


 
  
 
 
</div>

{/* ✅ Row 4 */}
<div className="row">
<StatCard label="Total Students" value={summary.totalStudents || 0} icon="fa-user-graduate" color="primary" />
<StatCard label="Total Merchants" value={summary.totalMerchants || 0} icon="fa-store" color="secondary" />
<StatCard label="Total Parents" value={summary.totalParents || 0} icon="fa-users" color="warning" />
<StatCard label="Attendance" value={`${summary.attendancePercent || 0}%`} icon="fa-calendar-check" color="info" progress={summary.attendancePercent || 0} />
  
  
 
</div>
<div className="row">

<StatCard label="Total Courses" value={summary.totalCourses || 0} icon="fa-book" color="dark" />
<StatCard label="Total Lectures" value={summary.totalLectures || 0} icon="fa-chalkboard-teacher" color="warning" />
<StatCard label="Lectures Today (Ended)" value={summary.totalLecturesToday || 0} icon="fa-calendar-check" color="success" />
<StatCard label="Lectures Today (Upcoming)" value={summary.upcomingLecturesToday || 0} icon="fa-hourglass-start" color="warning" />
</div>


<div className="row mt-4">
  <div className="col-lg-6">
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Monthly Purchases</h6>
      </div>
      <div className="card-body" style={{ height: "400px" }}>
  <canvas id="purchaseChart" width="100%" height="100%"></canvas>
</div>

    </div>
  </div>
</div>


         
           
            </div> {/* End container-fluid */}
          </div> {/* End content */}
        </div> {/* End content-wrapper */}
      </div> {/* End wrapper */}
    </div> // End page-top
  );
};

export default AdminHome;
