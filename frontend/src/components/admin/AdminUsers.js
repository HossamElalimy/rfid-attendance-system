import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [showView, setShowView] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [showLoginFields, setShowLoginFields] = useState(false);
  const [message, setMessage] = useState(""); // For error message
  const [successMessage, setSuccessMessage] = useState(""); // For success messages

  const [createForm, setCreateForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "student",
    status: "active",
    faculty: "",
    year: ""
  });

  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const all = res.data;
      const user = JSON.parse(localStorage.getItem("user"));
      const sorted = user ? [all.find(u => u._id === user._id), ...all.filter(u => u._id !== user._id)] : all;
      setUsers(sorted);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Username Validation (at least 6 characters, no special characters, no spaces)
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{6,}$/;  // At least 6 characters, no spaces or special characters
    const noSpaces = !/\s/.test(username);  // Check if there's no space in the username
    return usernameRegex.test(username) && noSpaces; // Username should also not have spaces
  };

  // Email Validation (standard email format)
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  // Password Validation (at least 6 chars, 1 uppercase, 1 number)
  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  };


  // Handle Create User Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    // Validate Inputs
    if (!validateUsername(createForm.username)) {
      setMessage("Username must be at least 6 characters, with no spaces or special characters.");
      return;
    }

    if (!validateEmail(createForm.email)) {
      setMessage("Please enter a valid email address (e.g., user@example.com).");
      return;
    }

    if (!validatePassword(createForm.password)) {
      setMessage("Password must be at least 6 characters, and contain at least one uppercase letter and one number.");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const existingUser = await axios.get("http://localhost:5000/api/users");
      const isUsernameTaken = existingUser.data.some(user => user.username === createForm.username);
      const isEmailTaken = existingUser.data.some(user => user.email === createForm.email);

      if (isUsernameTaken) {
        setMessage("Username already exists.");
        return;
      }

      if (isEmailTaken) {
        setMessage("Email already exists.");
        return;
      }

      await axios.post("http://localhost:5000/api/users", createForm);
      setShowCreate(false);
      setCreateForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "student",
        status: "active",
        faculty: "",
        year: ""
      });
      fetchUsers();
      setSuccessMessage("User created successfully.");
      setTimeout(() => setSuccessMessage(""), 2000); // Hide success message after 2 seconds
    } catch (err) {
      setMessage("Error creating user: " + err.response?.data?.error || err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { ...editForm };

     // Validate Username
  if (!validateUsername(editForm.username)) {
    setMessage("Username must be at least 6 characters, with no spaces or special characters.");
    return;
  }

  if (editForm.password && editForm.password !== "") {
    if (!validatePassword(editForm.password)) {
      setMessage("Password must be at least 6 characters, and contain at least one uppercase letter and one number.");
      return;
    }
    updatedData.password = editForm.password; // Only update the password if it's filled
  } else {
    delete updatedData.password; // Do not send password if not changed
  }

    try {
      await axios.put(`http://localhost:5000/api/users/${editForm._id}`, updatedData);
      setShowEdit(false);
      setSuccessMessage("User updated successfully.");
      setTimeout(() => setSuccessMessage(""), 2000); // Hide success message after 2 seconds
      fetchUsers();
    } catch (err) {
      setMessage("Error updating user: " + err.response?.data?.error || err.message);
    }
  };

  const openEdit = (user) => {
    setEditForm({ ...user, password: "", confirmPassword: "" });  // Reset password fields
    setShowEdit(true);
    setShowLoginFields(false);
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${deleteId}`);
      setShowDelete(false);
      setSuccessMessage("User deleted successfully.");
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 2000); // Hide success message after 2 seconds
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const viewDetails = (user) => {
    setViewUser(user);
    setShowView(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchUsers();

    const scripts = [
      "/assets/bootstrap/js/bootstrap.min.js",
      "/assets/js/bs-init.js",
      "/assets/js/theme.js"
    ];
    scripts.forEach(src => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });

    return () => {
      scripts.forEach(src => {
        const el = document.querySelector(`script[src="${src}"]`);
        if (el) document.body.removeChild(el);
      });
    };
  }, []);

  return (
    <div id="page-top">
      {/* Include stylesheets */}
      <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/assets/css/styles.min.css" />

      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-dark mb-0">Users Table</h3>
          <button className="btn btn-success" onClick={() => setShowCreate(true)}>
            <i className="fas fa-plus me-1"></i> Create User
          </button>
        </div>

        <div className="card shadow">
          <div className="card-header py-3">
            <p className="text-primary m-0 fw-bold">User Info</p>
          </div>
          <div className="card-body">
            <div className="table-responsive table mt-2">
              <table className="table my-0">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} onClick={() => viewDetails(user)} style={{ cursor: "pointer" }}>
                      <td>{user.userId || "-"}</td>
                      <td>
                        <img className="rounded-circle me-2" width="30" height="30"
                          src={`/assets/img/avatars/avatar${Math.floor(Math.random() * 3) + 1}.jpeg`}
                          alt="avatar" />
                        {user.username}
                        {currentUser && user._id === currentUser._id && <span className="text-muted"> (You)</span>}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.joined || user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${user.status === "blocked" ? "bg-danger" : "bg-success"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        
                        <button className="btn btn-sm btn-primary me-2"  onClick={() => openEdit(user)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => openDeleteModal(user._id)}>  
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
         {/* Error Modal */}
{message && (
  <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", zIndex: 9999 }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content" style={{ background: "rgba(255,255,255,0.9)", border: "none" }}>
        <div className="modal-header">
          <h5 className="modal-title text-danger">Error</h5>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setMessage("")}>Close</button>
        </div>
      </div>
    </div>
  </div>
)}
  {/* Success Confirmation Popup */}
  {successMessage && (
          <div className="position-fixed top-0 right-0 p-4" style={{ zIndex: 9999 }}>
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDelete && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content" style={{ background: "rgba(255,255,255,0.9)", border: "none" }}>
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this user?</p>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>No</button>
                  <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
        

        {/* Create Modal */}
        {showCreate && (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)",zIndex: 9998  }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleCreateSubmit} className="modal-content" style={{ background: "rgba(255,255,255,0.9)", border: "none" }}>
                <div className="modal-header">
                  <h5 className="modal-title text-success">Create New User</h5>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-2" name="username" placeholder="Username" onChange={handleCreateChange} required />
                  <input className="form-control mb-2" name="email" type="email" placeholder="Email" onChange={handleCreateChange} required />
                  <input className="form-control mb-2" name="password" type="password" placeholder="Password" onChange={handleCreateChange} required />
                  <input className="form-control mb-2" name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleCreateChange} required />
    {createForm.password !== createForm.confirmPassword && createForm.confirmPassword && (
      <span className="text-danger">Passwords do not match</span>
    )}
                  <input className="form-control mb-2" name="phoneNumber" placeholder="Phone Number" onChange={handleCreateChange} required />
                  <select className="form-select mb-2" name="role" onChange={handleCreateChange} value={createForm.role}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                  </select>
                  {createForm.role === "student" && (
                    <>
                      <input className="form-control mb-2" name="faculty" placeholder="Faculty" onChange={handleCreateChange} />
                      <input className="form-control mb-2" name="year" placeholder="Year of Study" onChange={handleCreateChange} />
                    </>
                  )}
                  <select className="form-select mb-2" name="status" onChange={handleCreateChange} value={createForm.status}>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

       {/* Edit Modal */}
{showEdit && editForm && (
  <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <form onSubmit={handleEditSubmit} className="modal-content" style={{ background: "rgba(255,255,255,0.9)", border: "none" }}>
        <div className="modal-header">
          <h5 className="modal-title text-primary">Edit User</h5>
        </div>
        <div className="modal-body">
          <label>Username</label>
          <input className="form-control mb-2" name="username" value={editForm.username} onChange={handleEditChange} required />

          <label>Role</label>
          <select className="form-select mb-2" name="role" value={editForm.role} onChange={handleEditChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="parent">Parent</option>
            <option value="admin">Admin</option>
          </select>

          <label>Phone Number</label>
          <input className="form-control mb-2" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange} placeholder="Phone number" required  />

          {editForm.role === "student" && (
            <>
              <input className="form-control mb-2" name="faculty" value={editForm.faculty || ""} onChange={handleEditChange} placeholder="Faculty" />
              <input className="form-control mb-2" name="year" value={editForm.year || ""} onChange={handleEditChange} placeholder="Year of Study" />
            </>
          )}

          <label>Status</label>
          <select className="form-select mb-2" name="status" value={editForm.status} onChange={handleEditChange}>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>

          {showLoginFields && (
            <>
              <label>Email</label>
              <input className="form-control mb-2" name="email" value={editForm.email} onChange={handleEditChange} />

              <label>New Password</label>
              <input className="form-control mb-2" name="password" placeholder="New Password" onChange={handleEditChange} />

              <label>Confirm New Password</label>
              <input className="form-control mb-2" name="confirmPassword" type="password" placeholder="Confirm New Password" onChange={handleEditChange} />
              {editForm.password !== editForm.confirmPassword && editForm.confirmPassword && (
                <span className="text-danger">Passwords do not match</span>
              )}
            </>
          )}
        </div>
        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
          <button type="button" className="btn btn-outline-dark" onClick={() => setShowLoginFields(!showLoginFields)}>
            {showLoginFields ? "Hide Login Info" : "Change Login Info"}
          </button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default AdminUsers;
