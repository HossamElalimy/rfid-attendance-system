import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import StudentStatCard from "../student/StudentStatCard";
import SocketContext from "../../contexts/SocketContext";

const TeacherHome = () => {
  const [summary, setSummary] = useState(null);
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/summary/${user.userId}`);
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching teacher summary:", err);
    }
  };

  useEffect(() => {
    fetchSummary();
    if (!socket) return;
    socket.on("lecture-updated", fetchSummary);
    return () => socket.off("lecture-updated", fetchSummary);
  }, [socket]);

  if (!summary) return <p className="text-center mt-5">Loading dashboard...</p>;

  return (
    <div className="container-fluid">
      <h4 className="mb-4 text-gray-800">Teacher Dashboard</h4>
      <div className="row">
        <StudentStatCard title="Total Courses" value={summary.totalCourses} iconClass="fas fa-book-open" textColor="primary" />
        <StudentStatCard title="Total Lectures" value={summary.totalLectures} iconClass="fas fa-chalkboard" textColor="info" />
        <StudentStatCard title="Lectures Today (Ended)" value={summary.endedToday} iconClass="fas fa-calendar-check" textColor="success" />
        <StudentStatCard title="Lectures Today (Upcoming)" value={summary.upcomingToday} iconClass="fas fa-hourglass-start" textColor="warning" />
        <StudentStatCard title="Ongoing Lectures" value={summary.ongoingLectures} iconClass="fas fa-spinner" textColor="secondary" />
        <StudentStatCard title="Attendance Taken Today" value={summary.attendanceTakenToday} iconClass="fas fa-clipboard-check" textColor="success" />
        <StudentStatCard title="Pending Lectures Today" value={summary.pendingLecturesToday} iconClass="fas fa-hourglass-half" textColor="danger" />
        
        
<StudentStatCard title="Total Students" value={summary.totalStudents} iconClass="fas fa-users" textColor="dark" />


      </div>
      {summary.courses.map(course => (
  <React.Fragment key={course.courseCode}>
    <div className="col-12">
      <h5 className="mt-4 mb-2 text-gray-700">
        📘 {course.courseCode} - Attendance Summary
      </h5>
    </div>
    <div className="row">
    <StudentStatCard
      title="Total Attended"
      value={course.attendance}
      iconClass="fas fa-check-circle"
      textColor="success"
    />
    <StudentStatCard
      title="Attendance Rate"
      value={`${course.attendanceRate}%`}
      iconClass="fas fa-chart-line"
      textColor="primary"
    />
    <StudentStatCard
      title="Late Students"
      value={course.late}
      iconClass="fas fa-clock"
      textColor="warning"
    />
    <StudentStatCard
      title="Late Rate"
      value={`${course.lateRate}%`}
      iconClass="fas fa-percentage"
      textColor="warning"
    />
    <StudentStatCard
      title="Absent Students"
      value={course.absent}
      iconClass="fas fa-user-times"
      textColor="danger"
    />
    <StudentStatCard
      title="Absent Rate"
      value={`${course.absentRate}%`}
      iconClass="fas fa-chart-pie"
      textColor="danger"
    />
    </div>
  </React.Fragment>
))}

    </div>
  );
};

export default TeacherHome;
