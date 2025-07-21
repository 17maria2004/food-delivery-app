import React from "react"; 
import { FaMapMarkedAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaLinkedinIn, FaInstagram, FaPinterest } from "react-icons/fa"; 
import './Footer.css';   

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section">
        <h3>Contact Us</h3>
        <address>
          <p><FaMapMarkedAlt /> Location</p>
          <p><FaPhone /> +961 81 112 817</p>
          <p><FaEnvelope /> tastybites@gmail.com</p>
        </address>
      </div>

      <div className="footer-section">
        <h3>Highlights</h3>
        <p>Discover our top picks and special offerings for your choosing.</p>
      </div>

      <nav className="social-icons" aria-label="Social Media Links">
        <a href="#" aria-label="Facebook"><FaFacebook /></a>
        <a href="#" aria-label="Twitter"><FaTwitter /></a>
        <a href="#" aria-label="LinkedIn"><FaLinkedinIn /></a>
        <a href="#" aria-label="Instagram"><FaInstagram /></a>
        <a href="#" aria-label="Pinterest"><FaPinterest /></a>
      </nav>

      <div className="footer-section">
        <h3>Opening Hours</h3>
        <p>Everyday</p>
        <p>10:00 AM - 10:00 PM</p>
      </div>

      <div className="footer-bottom">
        <p>© 2025 All Rights Reserved by Apoorv. Distributed by Apoorv.</p>
      </div>
    </footer>
  );
};

export default Footer;
