import React, { useEffect,useRef, useState } from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import axios from "axios";


import socket from "../../socket";
import { useContext } from "react";
import SocketContext from "../../contexts/SocketContext";

const rawUser = localStorage.getItem("user");
const user = rawUser ? JSON.parse(rawUser) : null;










const AdminHome = () => {
  const socket = useContext(SocketContext);

  const [summary, setSummary] = useState({});
  const [myWallet, setMyWallet] = useState(null);
  const purchaseChartRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const categoryChartRef = useRef(null); // for pie chart
  const [attendanceMode, setAttendanceMode] = useState("today");
  const [clickCount, setClickCount] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
const [customCourse, setCustomCourse] = useState("");
const [customStatus, setCustomStatus] = useState("ended");
const [customLectures, setCustomLectures] = useState([]);
const [selectedLecture, setSelectedLecture] = useState(null);
const [customCourseLabel, setCustomCourseLabel] = useState("");
const [customCourseCode, setCustomCourseCode] = useState("");
const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  const updateStatus = () => setIsConnected(true);
  const disconnectStatus = () => setIsConnected(false);

  socket.on("connect", updateStatus);
  socket.on("disconnect", disconnectStatus);

  return () => {
    socket.off("connect", updateStatus);
    socket.off("disconnect", disconnectStatus);
  };
}, []);


const fetchSummary = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/dashboard/summary?year=${selectedYear}`);
    setSummary(res.data);
  } catch (err) {
    console.error("Failed to fetch summary:", err);
  }
};





const handleCardClick = () => {
  setClickCount(prev => {
    const newCount = prev + 1;

    if (newCount % 3 === 1) {
      setAttendanceMode("all");
    } else if (newCount % 3 === 2) {
      setAttendanceMode("custom");
      setShowCustomModal(true); // ✅ open modal on 3rd click
    } else {
      setAttendanceMode("today");
    }

    return newCount;
  });
};



useEffect(() => {
  socket.on("lecture-updated", () => {
    console.log("🔄 Lecture updated - refreshing dashboard");
    fetchSummary(); // ✅ refresh the summary
  });

  return () => {
    socket.off("lecture-updated");
  };
}, []);

useEffect(() => {
  const handleConnect = () => {
    console.log("🟢 Socket connected:", socket.id);
    setIsConnected(true);
  };

  const handleDisconnect = (reason) => {
    console.warn("🔴 Socket disconnected:", reason);
    setIsConnected(false);
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);
  socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 Reconnection attempt ${attempt}`);
  });

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
    socket.off("reconnect_attempt");
  };
}, []);


  
useEffect(() => {

  
  const fetchLectures = async () => {
    if (!customCourse || !customStatus) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/lectures/by-course?courseId=${customCourse}&status=${customStatus}`
      );
      setCustomLectures(res.data);
    } catch {
      alert("Failed to fetch lectures");
      setCustomLectures([]);
    }
  };

  fetchLectures();
}, [customCourse, customStatus]);

  
  useEffect(() => {
    fetchSummary();

    const fetchMyWallet = async () => {
      if (!user?._id) return; // ✅ avoid crash
      try {
        const res = await axios.get(`http://localhost:5000/api/wallet/${user._id}`);
        setMyWallet(res.data.message === "No wallet" ? null : res.data);
      } catch (err) {
        console.error("Failed to fetch wallet", err);
        setMyWallet(null);
      }
    };
    
    
    fetchMyWallet();
    
  

    
    
  
    // 📊 Load Chart.js and render charts
    const chartScript = document.createElement("script");
    chartScript.src = "/assets/js/chart.min.js";
    chartScript.async = true;
    
    
    
  
    document.body.appendChild(chartScript);
    const interval = setInterval(fetchSummary, 5000); 
    return () => {
      clearInterval(interval);
      if (purchaseChartRef.current) {
        purchaseChartRef.current.destroy();
      }
      
      document.body.removeChild(chartScript);
    };
    
  }, [selectedYear]);
  useEffect(() => {
    if (!window.Chart || !summary.categoryPurchases?.length) return;
  
    const ctx = document.getElementById("categoryChart")?.getContext("2d");
    if (!ctx) return;
  
    if (categoryChartRef.current) categoryChartRef.current.destroy();
  
    categoryChartRef.current = new window.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: summary.categoryPurchases.map(item => item.label),
        datasets: [{
          data: summary.categoryPurchases.map(item => item.value),
          backgroundColor: [
            "#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b", "#6f42c1"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1200,
          easing: "easeOutBounce"
        },
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
      
    });
  }, [summary]);
  
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
        animation: {
          duration: 1000,
          easing: "easeOutQuart"
        },
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
  <div className="d-flex align-items-center gap-2">
    <h3 className="text-dark mb-0">Dashboard</h3>
    <span
      className={`badge bg-${isConnected ? "success" : "danger"}`}
      style={{ fontSize: "0.8rem" }}
    >
      {isConnected ? "Live" : "Offline"}
    </span>
  </div>
  <a className="btn btn-primary btn-sm d-none d-sm-inline-block" role="button" href="/">
    <i className="fas fa-download fa-sm text-white-50"></i>&nbsp;Generate Report
  </a>
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
<div className="col-md-6 col-xl-3 mb-4">
  <div className="card shadow border-start-info py-2 h-100" onClick={handleCardClick} style={{ cursor: "pointer" }}>
    <div className="card-body">
      <div className="row align-items-center no-gutters">
        <div className="col me-2">
        <div className="text-uppercase text-info fw-bold text-xs mb-1">
  {attendanceMode === "today"
    ? "Today's Attendance"
    : attendanceMode === "all"
    ? "All-Time Attendance"
    : `${customCourseLabel || "Customized"} Attendance`}
</div>


          <div className="row g-0 align-items-center">
            <div className="col-auto">
              <div className="text-dark fw-bold h5 mb-0 me-3">
                {attendanceMode === "today"
                  ? `${summary.attendancePercentToday || 0}%`
                  : `${summary.attendancePercent || 0}%`}
              </div>
            </div>
            <div className="col">
              <div className="progress progress-sm">
                <div
                  className="progress-bar bg-info"
                  style={{
                    width: `${
                      attendanceMode === "today"
                        ? summary.attendancePercentToday || 0
                        : summary.attendancePercent || 0
                    }%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (attendanceMode === "custom") setShowCustomModal(true);
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-auto">
          <i className="fas fa-chart-line fa-2x text-gray-300"></i>
        </div>
      </div>
    </div>
  </div>
</div>



  
  
 
</div>
<div className="row">

<StatCard label="Total Courses" value={summary.totalCourses || 0} icon="fa-book" color="dark" />
<StatCard label="Total Lectures" value={summary.totalLectures || 0} icon="fa-chalkboard-teacher" color="warning" />
<StatCard label="Lectures Today (Ended)" value={summary.totalLecturesToday || 0} icon="fa-calendar-check" color="success" />
<StatCard label="Lectures Today (Upcoming)" value={summary.upcomingLecturesToday || 0} icon="fa-hourglass-start" color="warning" />
</div>

<div className="row">

<StatCard
  label="Ongoing Lectures"
  value={summary.ongoingLectureCount || 0}
  icon="fa-chalkboard"
  color="warning"
/>


</div>
<div className="row mb-4">
  <div className="col-lg-3 offset-lg-9">
    <div className="input-group">
      <label className="input-group-text bg-primary text-white fw-bold">Year</label>
      <select
        className="form-select"
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
      >
        {[2025, 2024, 2023].map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
    </div>
  </div>
</div>



<div className="row mt-4">
  {/* Monthly Purchases Chart */}
  <div className="col-lg-6">
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Monthly Purchases</h6>
      </div>
      <div className="card-body d-flex align-items-center justify-content-center" style={{ height: "460px" }}>
      <canvas id="purchaseChart" style={{ width: "100%", height: "100%" }}></canvas>

</div>

    </div>
  </div>

  {/* Pie Chart by Category */}
  <div className="col-lg-6">
    <div className="card shadow mb-4">
      <div className="card-header py-3">
        <h6 className="m-0 font-weight-bold text-primary">Purchase Breakdown by Category</h6>
      </div>
      <div className="card-body d-flex align-items-center justify-content-center" style={{ height: "460px" }}>
  <div style={{ width: 400, height: 400 }}>
    <canvas id="categoryChart" width="400" height="400"></canvas>
  </div>
</div>


    </div>
  </div>
</div>



         
           
            </div> {/* End container-fluid */}
          </div> {/* End content */}
        </div> {/* End content-wrapper */}
        
      </div> {/* End wrapper */}
      {showCustomModal && (
  <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Customized Attendance</h5>
          <button
  type="button"
  className="btn-close"
  onClick={() => {
    setShowCustomModal(false);
    setCustomCourse("");
    setCustomStatus("ended");
    setCustomLectures([]);
    setSelectedLecture(null);
  }}
></button>

        </div>
        <div className="modal-body">
          <label className="form-label">Select Course</label>
          <select className="form-select mb-2" value={customCourse} onChange={e => setCustomCourse(e.target.value)}>
            <option disabled value="">-- Select Course --</option>
            {summary.courses?.map(course => (
  <option key={course._id} value={course._id}>{course.courseName}</option>
))}

          </select>

          <label className="form-label">Status</label>
          <select className="form-select mb-2" value={customStatus} onChange={e => setCustomStatus(e.target.value)}>
            <option value="ongoing">Ongoing</option>
            <option value="ended">Ended</option>
          </select>

          

          {customLectures.length > 0 && (
  <>
    <label className="form-label mt-3">Select Lecture</label>
    <select
      className="form-select mb-2"
      value={selectedLecture || ""}
      onChange={(e) => setSelectedLecture(e.target.value)}
    >
      <option value="" disabled>Choose a lecture</option>
      {customLectures.map((lec) => (
        <option key={lec._id} value={lec._id}>
          {lec.title}
        </option>
      ))}
    </select>

    <button
  className="btn btn-success w-100 mt-2"
  disabled={!selectedLecture}
  onClick={async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/dashboard/summary/lecture-attendance?lectureId=${selectedLecture}`
      );
      const { attendancePercent } = res.data;

      const selectedCourse = summary.courses?.find(c => c._id === customCourse);
      const courseCode = selectedCourse?.courseName || "Custom"; // ✅ FIXED HERE

      setSummary(prev => ({ ...prev, attendancePercent }));
      setCustomCourseLabel(courseCode); // ✅ this now works

      setShowCustomModal(false);
    } catch {
      alert("Failed to fetch attendance");
    }
  }}
>
  Update
</button>

  </>
)}



        </div>
      </div>
    </div>
  </div>
)}

    </div> // End page-top
    
  );
  

};


export default AdminHome;
