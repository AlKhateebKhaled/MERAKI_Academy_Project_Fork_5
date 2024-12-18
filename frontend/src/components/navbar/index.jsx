import React, { useEffect, useState } from "react";
import "./style.css";
import { FaShoppingCart, FaBars, FaTimes } from "react-icons/fa";
//import { RiAccountCircleFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLogout } from "../redux/reducers/auth";
import { clearRecived } from "../../components/redux/reducers/auth";
import axios from "axios";
import { FaHeart } from "react-icons/fa";

const Navbar = () => {
  const allMessages = useSelector((state) => state.auth.allMessages);
  const wishlistCount = useSelector((state) => state.product.count);
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const history = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const recived = useSelector((state) => state.auth.recived);

  const { userName } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      history(`/search/${encodeURIComponent(searchQuery.trim())}`);
    }
    setSearchQuery("");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(setLogout());
  };

  return (
    <div className="navbar_container">
      <nav className="navbar">
        <div className="nav-lift">
          <div class="logo">
            <div class="icon">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <h2>SmartCart</h2>
          </div>

          <div className={`navbar-links ${isOpen ? "active" : ""}`}>
            <ul>
              <li>
                <Link className="Navbar_Links" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="Navbar_Links" to="/Contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link className="Navbar_Links" to="/About">
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="navbar-icons">
          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
          <Link to="/wishlist" className="navbar-wishlist">
            Wishlist <FaHeart />
            {wishlistCount > 0 && (
              <span className="wishlist-count">{wishlistCount}</span>
            )}
          </Link>
         


          <a className="cart-icon">
            <FaShoppingCart onClick={() => history("/cart")} />
          </a>

          <button
            onClick={() => {
              dispatch(clearRecived());
            }}
            type="button"
            className="Notification"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-bell"
              viewBox="0 0 16 16"
            >
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
            </svg>
            <span className="badge">
              {recived?.length || 0}
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>


          {isLoggedIn && (
            <div className="navbar-user" onClick={() => history("/Profile")}>
              <span className="navbar-username">{userName}</span>
            </div>
          )}
          <div
            className="login-btn"
            onClick={() => {
              history(isLoggedIn ? "/users/login" : "/users/login");
              {
                isLoggedIn ? handleLogout : null;
              }
            }}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </div>

          <button className="navbar-toggle" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
