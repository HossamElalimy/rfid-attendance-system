import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin/home");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: "100vh" }}>
      {/* Import CSS from Bootstrap Studio */}
      <link rel="stylesheet" href="/assets/bootstrap/css/bootstrap.min.css" />
      <link rel="stylesheet" href="/assets/fonts/fontawesome-all.min.css" />
      <link rel="stylesheet" href="/assets/css/Login-Form-Clean.css" />
      <link rel="stylesheet" href="/assets/css/styles.min.css" />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg my-5">
              <div className="card-body p-5">
                <div className="text-center">
                  <h4 className="text-dark mb-4">Welcome Back!</h4>
                </div>
                <form className="user" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control form-control-user"
                      id="exampleInputEmail"
                      aria-describedby="emailHelp"
                      placeholder="Enter Email Address..."
                      name="email"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control form-control-user"
                      id="exampleInputPassword"
                      placeholder="Password"
                      name="password"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="rememberMe" />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember Me
                      </label>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary d-block btn-user w-100">
                    Login
                  </button>
                  {message && (
                    <div className="alert alert-danger mt-3 text-center py-2" role="alert">
                      {message}
                    </div>
                  )}
                </form>
                <hr />
                <div className="text-center">Forgot Password?
                  <a className="small" href="/"> Click Here</a>
                  <br />
                 
                </div>
              </div>
            </div>
            <div className="text-center text-white">
              <small>© RFID Attendance System</small>
            </div>
          </div>
        </div>
      </div>

      {/* Scripts for Bootstrap JS */}
      <script src="/assets/bootstrap/js/bootstrap.min.js"></script>
    </div>
  );
};

export default Login;
