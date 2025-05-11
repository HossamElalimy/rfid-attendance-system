import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCreditCard } from 'react-icons/fa';



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
  const [searchQuery, setSearchQuery] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [walletInfo, setWalletInfo] = useState(null);
  const [amount, setAmount] = useState(0);

  const [createForm, setCreateForm] = useState({
    username: "",
    fullName: "", // New Full Name field
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    role: "student",
    status: "active",
    faculty: "",
    year: "",
    merchantName: "", // Only for merchant users
    merchantType: "", // Only for merchant users
    studentID: "", // This will store the ID of the student if the role is parent
  });

  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      const all = res.data;
      const user = JSON.parse(localStorage.getItem("user"));
      const sorted = user
        ? [
            all.find((u) => u._id === user._id),
            ...all.filter((u) => u._id !== user._id),
          ]
        : all;
      setUsers(sorted);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };
  // Handle Wallet Click (to manage wallet)
  const handleWalletClick = async (userId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/wallet/${userId}`);
      setWalletInfo({ ...res.data, userId }); // Display wallet info if wallet exists
    } catch (err) {
      if (err.response?.status === 404) {
        setWalletInfo(null); // No wallet found for the user
      }
    }
  };

  // Handle Add or Deduct Balance in Wallet
  const handleBalanceChange = async () => {
    if (!walletInfo) return;
    try {
      const action = walletInfo.balance > 0 ? "deduct" : "add";
      const res = await axios.put(
        `http://localhost:5000/api/wallet/${walletInfo.walletID}`,
        { action, amount }
      );
      setWalletInfo(res.data);
    } catch (err) {
      console.error("Error updating wallet:", err);
    }
  };

  // Handle Create Wallet for User
  const handleCreateWallet = async (userId) => {
    try {
      const res = await axios.post("http://localhost:5000/api/wallet/create", {
        userID: userId,
      });
      setWalletInfo(res.data);
    } catch (err) {
      console.error("Error creating wallet:", err);
    }
  };

  // Search and link a student when creating a parent user

  const handleSearchStudent = async (query) => {
    if (query) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/search?query=${query}`
        );
        setStudentList(res.data); // Populate the student list with search results
      } catch (err) {
        console.error("Error searching students:", err);
        setMessage("Error searching students.");
      }
    } else {
      setStudentList([]); // Clear list if search is empty
    }
  };

  const handleStudentSelect = (student) => {
    // When a student is selected, set their ID in the form and clear the search results
    setCreateForm({
      ...createForm,
      studentID: student.userId,
    });
    setStudentList([]); // Clear the student list
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Username Validation (at least 6 characters, no special characters, no spaces)
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{6,}$/; // At least 6 characters, no spaces or special characters
    const noSpaces = !/\s/.test(username); // Check if there's no space in the username
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

    // Check if 'studentID' is required for parents
    if (createForm.role === "parent" && !createForm.studentID) {
      setMessage("Please select a student to link to this parent.");
      return;
    }

    if (createForm.role === "student") {
      if (!createForm.faculty || !createForm.year) {
        setMessage("Faculty and Year of Study are required for student role.");
        return;
      }
    }
    // Validate fullName
    if (!createForm.fullName) {
      setMessage("Full Name is required.");
      return;
    }
    // Validate Inputs
    if (!validateUsername(createForm.username)) {
      setMessage(
        "Username must be at least 6 characters, with no spaces or special characters."
      );
      return;
    }

    if (!validateEmail(createForm.email)) {
      setMessage(
        "Please enter a valid email address (e.g., user@example.com)."
      );
      return;
    }

    if (!validatePassword(createForm.password)) {
      setMessage(
        "Password must be at least 6 characters, and contain at least one uppercase letter and one number."
      );
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const existingUser = await axios.get("http://localhost:5000/api/users");
      const isUsernameTaken = existingUser.data.some(
        (user) => user.username === createForm.username
      );
      const isEmailTaken = existingUser.data.some(
        (user) => user.email === createForm.email
      );

      if (isUsernameTaken) {
        setMessage("Username already exists.");
        return;
      }

      if (isEmailTaken) {
        setMessage("Email already exists.");
        return;
      }

      // POST request to create user
      const userData = {
        ...createForm,
        merchantName:
          createForm.role === "merchant" ? createForm.merchantName : undefined,
        merchantType:
          createForm.role === "merchant" ? createForm.merchantType : undefined,
        studentID:
          createForm.role === "parent" ? createForm.studentID : undefined, // Only for parent role
      };

      if (
        createForm.role === "merchant" &&
        (!createForm.merchantName || !createForm.merchantType)
      ) {
        setMessage("Merchant Name and Merchant Type are required.");
        return;
      }
      console.log("Form Data before submit:", createForm);
      await axios.post("http://localhost:5000/api/users", createForm);
      setShowCreate(false);
      setCreateForm({
        username: "",
        fullName: "", // New Full Name field reset
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        role: "student",
        status: "active",
        faculty: "",
        year: "",
        merchantName: "",
        merchantType: "",
        studentID: "", // Reset studentID after creation
      });
      fetchUsers();
      setSuccessMessage("User created successfully.");
      setTimeout(() => setSuccessMessage(""), 2000); // Hide success message after 2 seconds
    } catch (err) {
      setMessage(
        "Error creating user: " + err.response?.data?.error || err.message
      );
    }
  };
  // Search students based on the user input
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setCreateForm({ ...createForm, studentID: query }); // Update student ID in form
    handleSearchStudent(query); // Trigger search based on query
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { ...editForm };
    // Validate fullName
    if (!editForm.fullName) {
      setMessage("Full Name is required.");
      return;
    }

    // Validate faculty and year for student role
    if (editForm.role === "student") {
      if (!editForm.faculty || !editForm.year) {
        setMessage("Faculty and Year of Study are required for student role.");
        return;
      }
    }
    // Validate Username
    if (!validateUsername(editForm.username)) {
      setMessage(
        "Username must be at least 6 characters, with no spaces or special characters."
      );
      return;
    }

    if (editForm.password && editForm.password !== "") {
      if (!validatePassword(editForm.password)) {
        setMessage(
          "Password must be at least 6 characters, and contain at least one uppercase letter and one number."
        );
        return;
      }
      updatedData.password = editForm.password; // Only update the password if it's filled
    } else {
      delete updatedData.password; // Do not send password if not changed
    }

    // Add merchantName and merchantType if the role is merchant
    if (editForm.role === "merchant") {
      updatedData.merchantName = editForm.merchantName;
      updatedData.merchantType = editForm.merchantType;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/users/${editForm._id}`,
        updatedData
      );
      setShowEdit(false);
      setSuccessMessage("User updated successfully.");
      setTimeout(() => setSuccessMessage(""), 2000); // Hide success message after 2 seconds
      fetchUsers();
    } catch (err) {
      setMessage(
        "Error updating user: " + err.response?.data?.error || err.message
      );
    }
  };

  const openEdit = (user) => {
    setEditForm({
      ...user,
      password: "", // Don't show password field by default
      confirmPassword: "", // Don't show confirm password field by default
    });
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
      "/assets/js/theme.js",
    ];
    scripts.forEach((src) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    });

    return () => {
      scripts.forEach((src) => {
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
      {/* Code for table, user management, and wallet interaction */}
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-dark mb-0">Users Table</h3>
          <button
            className="btn btn-success"
            onClick={() => setShowCreate(true)}
          >
            <i className="fas fa-plus me-1"></i> Create New User
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
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => viewDetails(user)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{user.userId || "-"}</td>
                      <td>
                        <img
                          className="rounded-circle me-2"
                          width="30"
                          height="30"
                          src={`/assets/img/avatars/avatar${
                            Math.floor(Math.random() * 3) + 1
                          }.jpeg`}
                          alt="avatar"
                        />
                        {user.username}
                        {currentUser && user._id === currentUser._id && (
                          <span className="text-muted"> (You)</span>
                        )}
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {new Date(
                          user.joined || user.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.status === "blocked"
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleWalletClick(user._id)}>
                        <i className="fas fa-wallet"></i> Manage Wallet
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() => openEdit(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => openDeleteModal(user._id)}
                        >
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

          {/* Wallet Management Popup */}
          {walletInfo && (
  <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content" style={{ background: "rgba(255,255,255,0.9)", border: "none" }}>
        <div className="modal-header">
          <h5 className="modal-title">Wallet Information</h5>
        </div>
        <div className="modal-body">
          <p>Wallet ID: {walletInfo.walletID}</p>
          <p>Balance: {walletInfo.balance}</p>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
          />
          <button onClick={handleBalanceChange}>Add/Deduct Balance</button>
        </div>
        <div className="modal-footer">
          <button onClick={() => handleCreateWallet(walletInfo.userId)}>Create Wallet</button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setWalletInfo(null)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}  


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
          <div
            className="position-fixed top-0 right-0 p-4"
            style={{ zIndex: 9999 }}
          >
            <div className="alert alert-success" role="alert">
              {successMessage}
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDelete && (
          <div
            className="modal d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content"
                style={{ background: "rgba(255,255,255,0.9)", border: "none" }}
              >
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Confirm Delete</h5>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this user?</p>
                </div>
                <div className="modal-footer">
  <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>No</button>
  <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
</div>  // This is correct, but ensure closing div's match and are properly nested.

              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div
            className="modal d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(6px)",
              zIndex: 9998,
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <form
                onSubmit={handleCreateSubmit}
                className="modal-content"
                style={{ background: "rgba(255,255,255,0.9)", border: "none" }}
              >
                <div className="modal-header">
                  <h5 className="modal-title text-success">Create New User</h5>
                </div>
                <div className="modal-body">
                  <input
                    className="form-control mb-2"
                    name="username"
                    placeholder="Username"
                    onChange={handleCreateChange}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="fullName"
                    placeholder="Full Name"
                    onChange={handleCreateChange}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleCreateChange}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleCreateChange}
                    required
                  />
                  <input
                    className="form-control mb-2"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    onChange={handleCreateChange}
                    required
                  />
                  {createForm.password !== createForm.confirmPassword &&
                    createForm.confirmPassword && (
                      <span className="text-danger">
                        Passwords do not match
                      </span>
                    )}
                  <input
                    className="form-control mb-2"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    onChange={handleCreateChange}
                    required
                  />
                  <select
                    className="form-select mb-2"
                    name="role"
                    onChange={handleCreateChange}
                    value={createForm.role}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                    <option value="merchant">Merchant</option>
                  </select>
                  {createForm.role === "student" && (
                    <>
                      <input
                        className="form-control mb-2"
                        name="faculty"
                        value={createForm.faculty}
                        placeholder="Faculty"
                        onChange={handleCreateChange}
                      />
                      <input
                        className="form-control mb-2"
                        name="year"
                        value={createForm.year}
                        placeholder="Year of Study"
                        onChange={handleCreateChange}
                      />
                    </>
                  )}

                  {/* Merchant Fields for Merchant Role */}
                  {createForm.role === "merchant" && (
                    <>
                      <input
                        className="form-control mb-2"
                        name="merchantName"
                        placeholder="Merchant Name"
                        onChange={handleCreateChange}
                        value={createForm.merchantName}
                      />
                      <input
                        className="form-control mb-2"
                        name="merchantType"
                        placeholder="Merchant Type"
                        onChange={handleCreateChange}
                        value={createForm.merchantType}
                      />
                    </>
                  )}

                  {createForm.role === "parent" && (
                    <div>
                      <input
                        className="form-control mb-2"
                        name="studentID"
                        placeholder="Enter Student ID (e.g., S01)"
                        value={createForm.studentID}
                        onChange={handleSearchChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={() =>
                          handleSearchStudent(createForm.studentID)
                        }
                      >
                        Search
                      </button>
                      {studentList.length > 0 && (
                        <ul>
                          {studentList.map((student) => (
                            <li
                              key={student._id}
                              onClick={() => handleStudentSelect(student)}
                            >
                              {student.userId} - {student.fullName}
                            </li>
                          ))}
                        </ul>
                      )}
                      {message && <div>{message}</div>}
                    </div>
                  )}

                  <select
                    className="form-select mb-2"
                    name="status"
                    onChange={handleCreateChange}
                    value={createForm.status}
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && editForm && (
          <div
            className="modal d-block"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <form
                onSubmit={handleEditSubmit}
                className="modal-content"
                style={{ background: "rgba(255,255,255,0.9)", border: "none" }}
              >
                <div className="modal-header">
                  <h5 className="modal-title text-primary">Edit User</h5>
                </div>
                <div className="modal-body">
                  <label>Username</label>
                  <input
                    className="form-control mb-2"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    required
                  />
                  <label>Full Name</label>
                  <input
                    className="form-control mb-2"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    required
                  />

                  <label>Role</label>
                  <select
                    className="form-select mb-2"
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                    <option value="admin">Admin</option>
                    <option value="merchant">Merchant</option>
                  </select>

                  <label>Phone Number</label>
                  <input
                    className="form-control mb-2"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                    placeholder="Phone number"
                    required
                  />

                  {editForm.role === "student" && (
                    <>
                      <input
                        className="form-control mb-2"
                        name="faculty"
                        value={editForm.faculty || ""}
                        onChange={handleEditChange}
                        placeholder="Faculty"
                      />
                      <input
                        className="form-control mb-2"
                        name="year"
                        value={editForm.year || ""}
                        onChange={handleEditChange}
                        placeholder="Year of Study"
                      />
                    </>
                  )}

                  {editForm.role === "merchant" && (
                    <>
                      <input
                        className="form-control mb-2"
                        name="merchantName"
                        placeholder="Merchant Name"
                        onChange={handleEditChange}
                        value={editForm.merchantName || ""}
                      />
                      <input
                        className="form-control mb-2"
                        name="merchantType"
                        placeholder="Merchant Type"
                        onChange={handleEditChange}
                        value={editForm.merchantType || ""}
                      />
                    </>
                  )}

                  <label>Status</label>
                  <select
                    className="form-select mb-2"
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                  >
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>

                  {showLoginFields && (
                    <>
                      <label>Email</label>
                      <input
                        className="form-control mb-2"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                      />

                      <label>New Password</label>
                      <input
                        className="form-control mb-2"
                        name="password"
                        placeholder="New Password"
                        onChange={handleEditChange}
                      />

                      <label>Confirm New Password</label>
                      <input
                        className="form-control mb-2"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm New Password"
                        onChange={handleEditChange}
                      />
                      {editForm.password !== editForm.confirmPassword &&
                        editForm.confirmPassword && (
                          <span className="text-danger">
                            Passwords do not match
                          </span>
                        )}
                    </>
                  )}
                </div>
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEdit(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setShowLoginFields(!showLoginFields)}
                  >
                    {showLoginFields ? "Hide Login Info" : "Change Login Info"}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
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
