import React, { useState, useEffect, useContext ,useRef} from "react";
import axios from "axios";
import SocketContext from "../../contexts/SocketContext";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";




const TeacherLectures = () => {
  const socket = useContext(SocketContext);
  const user = JSON.parse(localStorage.getItem("user"));
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [status, setStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterDate, setFilterDate] = useState(null);

const [teacherCourses, setTeacherCourses] = useState([]);
const lastFetchTimeRef = useRef(0);






const fetchLectures = async () => {
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) return;
    lastFetchTimeRef.current = now;
  
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/live-lectures/${user.userId}`);
      setLectures(res.data);
    } catch (err) {
      console.error("Error fetching lectures:", err);
    }
  };
  
  

  const getStatus = (start, end, day) => {
    const now = moment();
    const todayStr = filterDate
      ? moment(filterDate).format("YYYY-MM-DD")
      : now.format("YYYY-MM-DD");
  
    const todayDay = filterDate
      ? moment(filterDate).format("dddd")
      : now.format("dddd");
  
    if (todayDay !== day) return "Not Today";
  
    const startTime = moment(`${todayStr}T${start}`, "YYYY-MM-DDTHH:mm");
    const endTime = moment(`${todayStr}T${end}`, "YYYY-MM-DDTHH:mm");
  
    if (now.isBefore(startTime)) return "Upcoming";
    if (now.isAfter(endTime)) return "Ended";
    return "Ongoing";
  };
  
  

  const openLectureModal = async (lec) => {
    const stat = getStatus(lec.startTime, lec.endTime);
    setSelectedLecture(lec);
    setStatus(stat);
    try {
      const res = await axios.get(`http://localhost:5000/api/teacher/attendance/${lec._id}`);
      setAttendance(res.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleAttendanceChange = (index, field, value) => {
    const updated = [...attendance];
    updated[index][field] = value;
    setAttendance(updated);
  };

  const saveAttendance = async (record) => {
    await axios.put(`http://localhost:5000/api/teacher/attendance/${record._id}`, record);
    fetchLectures();
  };

  const deleteAttendance = async (recordId) => {
    await axios.delete(`http://localhost:5000/api/teacher/attendance/${recordId}`);
    setAttendance(attendance.filter(a => a._id !== recordId));
  };

  const addAttendance = async () => {
    const newRecord = {
      lectureId: selectedLecture._id,
      studentId: "", fullName: "", loginTime: "", logoutTime: "", status: "Absent"
    };
    const res = await axios.post(`http://localhost:5000/api/teacher/attendance`, newRecord);
    setAttendance([...attendance, res.data]);
  };


  const fetchTeacherCourses = async () => {
    try {
      setTeacherCourses([]); // ⛔ clear old list first
      const res = await axios.get(`http://localhost:5000/api/teacher/courses/${user.userId}`);
      setTeacherCourses(res.data); // ✅ set only valid ones
    } catch (err) {
      console.error("Error fetching teacher courses:", err);
    }
  };
  
  
     
  

  useEffect(() => {
    if (!user?.userId) return;
  
    fetchLectures();         // ✅ throttled now
    fetchTeacherCourses();   // unchanged
  
    const handleUpdate = (updatedLectureId) => {
      fetchLectures(); // 🔁 still throttled
      if (selectedLecture && selectedLecture._id === updatedLectureId) {
        openLectureModal(selectedLecture);
      }
    };
  
    socket.on("attendance-updated", handleUpdate);
  
    return () => {
      socket.off("attendance-updated", handleUpdate);
    };
  }, [user]);
  // ✅ removed selectedLecture to prevent infinite reattachment
  
  
  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Lectures Today</h3>
    
      <div className="row mb-3">
  <div className="col-md-6">
    <DatePicker
      className="form-control"
      selected={filterDate}
      onChange={(date) => setFilterDate(date)}
      placeholderText="Filter by Date"
      dateFormat="yyyy-MM-dd"
    />
  </div>

  <div className="col-md-6">
    <select
      className="form-select"
      value={filterCourse}
      onChange={(e) => setFilterCourse(e.target.value)}
    >
      <option value="">All Courses</option>
      {teacherCourses.map((course) => (
        <option key={course.courseCode} value={course.courseCode}>
          {course.courseCode}
        </option>
      ))}
    </select>
  </div>
</div>






      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Day</th>
            <th>Starts At</th>
            <th>Ends At</th>
            <th>Status</th>
            <th>Attendance / Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
        {lectures
.filter((lec) => {
    const matchCourse = filterCourse ? lec.courseCode === filterCourse : true;

    const matchDate = filterDate
    ? moment(filterDate).format("dddd") === lec.day
    : true;
  
  
    return matchCourse && matchDate;
  })
  
  .map((lec) => {

    const stat = getStatus(lec.startTime, lec.endTime, lec.day);

            return (
                <tr key={lec._id || `${lec.courseCode}-${lec.startTime}`}>

                <td>{lec.courseCode}</td>
                <td>{lec.courseName}</td>
                <td>{lec.day}</td>
                <td>{moment(lec.startTime, "HH:mm").format("hh:mm A")}</td>
<td>{moment(lec.endTime, "HH:mm").format("hh:mm A")}</td>

                <td><span className={`badge bg-${stat === "Ongoing" ? "success" : stat === "Ended" ? "secondary" : "info"}`}>{stat}</span></td>
                <td>{lec.attendedCount ?? "-"} / {lec.totalStudents ?? "-"}</td>
                <td>
                  <button className="btn btn-primary btn-sm" disabled={stat === "Upcoming"} onClick={() => openLectureModal(lec)}>Manage</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Attendance Modal */}
      {selectedLecture && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Attendance - {selectedLecture.courseCode}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedLecture(null)}></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
                      <th>Full Name</th>
                      <th>Login Time</th>
                      <th>Logout Time</th>
                      <th>Status</th>
                      {status === "Ongoing" && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                  {attendance.map((record, index) => (
  <tr key={record._id || index}>

                        <td>{record.studentId}</td>
                        <td><input className="form-control" value={record.fullName} onChange={(e) => handleAttendanceChange(index, "fullName", e.target.value)} disabled={status !== "Ongoing"} /></td>
                        <td><input type="time" className="form-control" value={record.loginTime} onChange={(e) => handleAttendanceChange(index, "loginTime", e.target.value)} disabled={status !== "Ongoing"} /></td>
                        <td><input type="time" className="form-control" value={record.logoutTime} onChange={(e) => handleAttendanceChange(index, "logoutTime", e.target.value)} disabled={status !== "Ongoing"} /></td>
                        <td>
                          <select className="form-select" value={record.status} onChange={(e) => handleAttendanceChange(index, "status", e.target.value)} disabled={status !== "Ongoing"}>
                            <option>Attended</option>
                            <option>Late</option>
                            <option>Absent</option>
                          </select>
                        </td>
                        {status === "Ongoing" && (
                          <td>
                            <button className="btn btn-success btn-sm me-2" onClick={() => saveAttendance(record)}>Save</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteAttendance(record._id)}>Delete</button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                {status === "Ongoing" && <button className="btn btn-secondary" onClick={addAttendance}>Add New</button>}
                <button className="btn btn-outline-dark" onClick={() => setSelectedLecture(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLectures;