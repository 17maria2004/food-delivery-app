import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";
import { FaUser, FaShoppingCart, FaSearch, FaBars, FaTimes, } from "react-icons/fa";

const FormBox = ({ title, buttonText, onSubmit }) => (
  <div className="login-box">
    <h2 className="login-title">{title}</h2>
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          required
        />
      </div>
      <button className="login-button" type="submit">
        {buttonText}
      </button>
    </form>
  </div>
);

const NavBar = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [cartCount, setCartCount] = useState(0); // State for cart item count
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:5000/api/cart-count?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setCartCount(data.count);
        })
        .catch((error) => console.error("Error fetching cart count:", error));
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    setUserId(null);
    setCartCount(0); // Reset cart count on logout
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    setSearchQuery(""); // Clear search when opened
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSignUp(false); // Reset to login form when modal is closed
  };
  const handleSignUpClick = () => setIsSignUp(true);
  const handleLoginClick = () => setIsSignUp(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      console.log("📌 Server Response:", data);

      if (data.user && data.user.id) {
        alert("✅ Login Successful!");
        localStorage.setItem("user_id", data.user.id);//locastorage hiye storage lal folder kello aa baado fiyo kelshi mnaamello setitem
        setUserId(data.user.id);
        handleCloseModal();
      }
    } catch (error) {
      console.error("❌ Error logging in:", error);
      alert(`❌ ${error.message}`);
    }
  };


  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    console.log("🛠️ Sending Sign-Up Request:", { email, password });

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📌 Server Response:", data);

      if (response.ok) {
        alert("✅ Signup Successful!");
        handleCloseModal();
      } else {
        alert(`❌ Signup Failed: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ Error signing up:", error);
    }
  };

  return (
    <nav className="navbar">
      <h1 className="navbar-logo">Tasty Bites</h1>
      <div className={isMobile ? "nav-links-mobile show" : "nav-links"}>
        <Link to="/">Home</Link>
        <Link to="/menu">Menu</Link>
        <Link to="/about">About</Link>
        <Link to="/add-address">Address</Link>
        <Link to="/testimonial">Feedback</Link>
        <Link to="/cart">
          <div className="cart-icon-container">
            <FaShoppingCart className="cart-icon" />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </div>
        </Link>
        <div className="search-container">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="search-form">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />

              <button type="submit" className="search-button">
                <FaSearch />
              </button>

              <button
                type="button"
                className="close-search"
                onClick={toggleSearch} // Closes the search bar
              >
                ✕
              </button>
            </form>
          ) : (
            <FaSearch className="nav-icon" onClick={toggleSearch} />
          )}
        </div>

        {userId ? (
          <button className="nav-icon logout" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <FaUser className="nav-icon" onClick={handleOpenModal} />
        )}
      </div>

      <div
        className="mobile-menu-icon"
        aria-expanded={isMobile}
        onClick={() => setIsMobile(!isMobile)}
      >
        {isMobile ? <FaTimes /> : <FaBars />}
      </div>

      {isModalOpen && (
        <div
          className="modal-overlay"
          aria-hidden={!isModalOpen}
          onClick={handleCloseModal}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={handleCloseModal}>
              X
            </button>

            {isSignUp ? (
              <FormBox
                title="SIGN UP"
                buttonText="Sign Up"
                onSubmit={handleSignUpSubmit}
              />
            ) : (
              <FormBox
                title="LOGIN"
                buttonText="LOGIN"
                onSubmit={handleLoginSubmit}
              />
            )}

            <div className="login-links">
              {isSignUp ? (
                <Link to="#" className="signup-link" onClick={handleLoginClick}>
                  Already have an account? Log in
                </Link>
              ) : (
                <Link
                  to="#"
                  className="signup-link"
                  onClick={handleSignUpClick}
                >
                  Don't have an account? Sign up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
