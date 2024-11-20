import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setLogin,
  setUserId,
  setUserName,
} from "../../components/redux/reducers/auth";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const history = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCompletedRegister, setIsCompletedRegister] = useState(false);

  const validateEmail = (email) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const login = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setMessage("");
    setIsLoading(true);

    if (!email) {
      setEmailError("Email is required");
      setIsLoading(false);
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      setIsLoading(false);
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters, include at least one number, one letter, and one special character"
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await axios.post("http://localhost:5000/users/login", {
        email,
        password,
      });
      if (result.data) {
        dispatch(setLogin(result.data.token));
        dispatch(setUserId(result.data.userId));
        dispatch(setUserName(result.data.userName));
        setMessage("");
        setStatus(true);
        console.log(result.data);
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Error happened while Login, please try again"
      );
      setStatus(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setMessage("");
    if (!email) {
      setEmailError("Please enter your email to reset password");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setIsLoading(true);
      const result = await axios.post(
        "http://localhost:5000/users/forgot-password",
        { email }
      );
      setMessage(
        result.data.success
          ? "A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password."
          : "Error: " + result.data.message
      );
      setStatus(result.data.success);
    } catch {
      setMessage("Error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = (response) => {
    const { credential } = response;
    axios
      .post("http://localhost:5000/users/google-login", { token: credential })
      .then((res) => {
        dispatch(setLogin(res.data.token));
        dispatch(setUserId(res.data.userId));
        setIsCompletedRegister(res.data.isComplete);
        dispatch(setUserName(res.data.userName));
        console.log(res.data);

        if (res.data.isComplete) {
          history("/");
        } else {
          history(`/google-complete-register/${res.data.userId}`);
        }
      })
      .catch((err) => console.error("Google login error:", err));
  };

  const handleGoogleLoginFailure = (error) =>
    console.error("Google login failure:", error);

  useEffect(() => {
    if (isLoggedIn && isCompletedRegister) {
      history("/");
    }
  }, [isLoggedIn, isCompletedRegister, history]);

  const handleRegisterClick = () => {
    history("/users");
  };

  return (
    <div className="Login_Container">
      <div className="Login_Form">
        <p className="Title">Login:</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {emailError && <div className="error-note">{emailError}</div>}
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
          </span>
        </div>
        {passwordError && <div className="error-note">{passwordError}</div>}
        {message && (
          <div
            className={status ? "SuccessMessage_login" : "ErrorMessage_login"}
          >
            {message}
          </div>
        )}
        <div className="button-container_Login">
          <button onClick={login} className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner-container">
                <div className="spinner"></div>
              </div>
            ) : (
              "Login"
            )}
          </button>
          <a onClick={handleForgotPassword} className="forgot-password-link">
            Forgot Password?
          </a>
          <div className="register-section">
            <span>Don't have an account?</span>
            <button onClick={handleRegisterClick} className="register-button">
              Register Here
            </button>
          </div>
          <div className="Google_Login_Container">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
