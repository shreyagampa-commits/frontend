import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Optional: for custom styling
import { useEffect } from 'react';
import { API_URL, model_URL } from '../data/apipath';


function Home() {
  useEffect(() => {
    const activatemodel=async()=>{
      try{
        const status=await fetch(`${model_URL}`,{
          method:'GET',
        })
        if(!status.ok){  
          console.log("model is down");
        }
      }catch(err){
        console.log(err)
      }
    }
    const activatebacked=async()=>{
      try{
        const status=await fetch(`${API_URL}/`,{
          method:'HEAD',
        })
        if(!status.ok){  
          console.log("backend is down");
        }
      }catch(err){
        console.log(err)
      }
    }
    activatemodel();
    activatebacked();
  })
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to Jewelry Pattern Generator</h1>
        <p>Create and explore unique jewelry designs.</p>
        <div className="hero-buttons">
          <Link to="/login" className="btn">Login</Link>
          <Link to="/signup" className="btn">Sign Up</Link>
        </div>
      </div>

      <div className="features-section">
        <h2>Our Features</h2>
        <div className="features">
          <div className="feature">
            <h3>Pattern Generation</h3>
            <p>Generate intricate jewelry designs using AI.</p>
          </div>
          <div className="feature">
            <h3>Customization</h3>
            <p>Customize patterns to suit your style and preferences.</p>
          </div>
          <div className="feature">
            <h3>User Profiles</h3>
            <p>Create an account to save and share your designs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
