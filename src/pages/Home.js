import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Optional: for custom styling
import { API_URL, model_URL } from '../data/apipath';

function Home() {
  useEffect(() => {
    const activatemodel = async () => {
      try {
        const status = await fetch(`${model_URL}`, {
          method: 'GET',
        });
        if (!status.ok) {
          console.log("Model is down");
        }
      } catch (err) {
        console.log(err);
      }
    };
    
    const activatebacked = async () => {
      try {
        const status = await fetch(`${API_URL}/`, {
          method: 'HEAD',
        });
        if (!status.ok) {
          console.log("Backend is down");
        }
      } catch (err) {
        console.log(err);
      }
    };

    activatemodel();
    activatebacked();
  }, []); // Add an empty dependency array to run the effect only once

  return (
    <div className="home-container container">
      <div className="hero-section bg-light p-5 rounded text-center mb-5 shadow-sm">
        <h1 className="display-4 text-primary">Welcome to Jewelry Pattern Generator</h1>
        <p className="lead">Create and explore unique jewelry designs.</p>
        <div className="hero-buttons mt-4">
          <Link to="/login" className="btn btn-primary mx-2">Login</Link>
          <Link to="/signup" className="btn btn-outline-primary mx-2">Sign Up</Link>
        </div>
      </div>

      <div className="features-section text-center mb-5">
        <h2 className="text-secondary mb-4">Our Features</h2>
        <div className="row justify-content-center">
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="feature card p-4 shadow-sm border-0">
              <h3 className="text-dark">Pattern Generation</h3>
              <p>Generate intricate jewelry designs using AI.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="feature card p-4 shadow-sm border-0">
              <h3 className="text-dark">Customization</h3>
              <p>Customize patterns to suit your style and preferences.</p>
            </div>
          </div>
          <div className="col-md-4 col-sm-6 mb-4">
            <div className="feature card p-4 shadow-sm border-0">
              <h3 className="text-dark">User Profiles</h3>
              <p>Create an account to save and share your designs.</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center mt-5">
        <p className="text-muted">&copy; {new Date().getFullYear()} Jewelry Pattern Generator. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
