import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/contact.css';
import { Link } from 'react-router-dom';
import { API_URL } from '../data/apipath';
const Contact = () => {
  const Navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    mobile: '',
    concern: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch(`${API_URL}/vendor/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
          mobile: formData.mobile,
          concern: formData.concern
        })
      });
      const result = await response.json();
      if (result.success) {
        alert(result.feedback);
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          mobile: '',
          concern: ''
        });
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  return (
    <div className="contact-page">
      <header>
      <nav id="nav" className="nav">
      <img src={'ed.jpg'} alt="logo" className="imglogo" />
          <div className="logo" id="logo">Elite Designs</div>
          <button
          className="hamburger"
          onClick={() =>{ setNavOpen(!navOpen);console.log("Hamburger clicked. navOpen state:", !navOpen);}}
          aria-expanded={navOpen}
          aria-controls="navitems"
        >
          ☰
        </button>
          <div className={!navOpen ? 'navitems' : 'notnavitems'} id="navitems">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Explore</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <button onClick={() => Navigate('/login')} className="uploadbtn">Get Started</button>
            </ul>
          </div>
        </nav>
      </header>

      <div className="contact-container">
        <form id="contact-form" onSubmit={handleSubmit} className="feedback">
          <h2>Contact Us</h2>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="mobile"
            id="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
          <h4>Share Your Thoughts</h4>
          <textarea
            name="concern"
            id="concern"
            placeholder="Your message..."
            value={formData.concern}
            onChange={handleChange}
            required
          />
          <input type="submit" value="Send" id="button" />
        </form>
      </div>
      <footer style={{ backgroundColor: "black", color: "white", position: "fixed", bottom: "0", width: "100%", height: "4vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem"}}className='lfooter'>
      <div className="footer">
          <p className='copyright'>©2024 Elite Designs</p>
          <p className="socialmedia">E-mail, Instagram, X</p>
          <p className='mail'>elitedesigns.g169@gmail.com</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
