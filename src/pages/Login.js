import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import '../css/Login.css'
import { API_URL } from '../data/apipath'
import {useGoogleLogin } from '@react-oauth/google';
// import { googleAuth } from '../data/api'
// import { handleError, handleSuccess } from '../utils'
const Login = () => {
  const navigate=useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [Logininfo, setLoginInfo] = useState({
    email: '',
    password: ''
  })
  const handleChange = (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    // console.log(name, value);
    const copyLogininfo = { ...Logininfo };
    copyLogininfo[name] = value;
    setLoginInfo(copyLogininfo);
  }
  // console.log(Logininfo);
  const handleLogin =async(e) => {
    e.preventDefault();
    // console.log(Logininfo);
    const { email, password} = Logininfo;
    if(!email || !password) {
      return alert('Fill the details')
    }try{
      console.log(Logininfo);
      const res = await fetch(`${API_URL}/vendor/login`, {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Logininfo)
      })
      // console.log(res);
      const result= await res.json();
      // console.log(result);
      const {msg,success,token,err}=result;
      if(success){
        window.confirm("logined successfully");
        localStorage.setItem('logintoken',token)
        setLoginInfo({
          email: '',
          password: ''
        })
        // localStorage.setItem('loggedUsername',name)
        setTimeout(()=>{
          navigate('/main')
        },1000)
      }   
      else if(err){
        const details=err?.details[0].msg;
        alert(details)
      }else if(!success){
        alert(msg)
      }
    }catch(err){
      console.log(err);
    }
  }
  const responseGoogle = async (res) => {
    console.log(res);
    try {
      if (res['code']) {
        const result = await fetch(`${API_URL}/vendor/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: res['code'] }),
        });
        if (!result.ok) {
          throw new Error('Failed to authenticate with Google');
        }
        const data = await result.json();
        console.log('Google login successful:', data);
        localStorage.setItem('logintoken', data.token);
        navigate('/main');
      }
    } catch (err) {
      console.error('Error during Google login:', err);
    }
  };
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Function to toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="body">
      <header>
      <nav id="nav" className="nav">
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
              <button onClick={() => window.location.href='/login'} className="uploadbtn">Get Started</button>
            </ul>
          </div>
        </nav>
      </header>
      <div className="containerlogin">
        {/* <Link to="/" className="link h">Home</Link> */}
        <h2 className="heading">Login</h2>
        <form onSubmit={handleLogin} id="login-form">
          <div className="details">
            <label htmlFor="email">Email:</label><br />
            <input
              onChange={handleChange}
              type="email"
              name="email"
              autoFocus
              placeholder="Enter your Email"
              value={Logininfo.email}
            />
          </div>
          <div className="details">
            <label htmlFor="password">Password:</label><br />
            <input
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={Logininfo.password}
            />
            <button type="button" id="togglePassword" className="toggle-password" style={{width:"fit-content"}} onClick={togglePassword}>
            {showPassword ? <i className="fas fa-eye-slash a"></i> : <i className="fas fa-eye a"></i>}
          </button>
          </div>
          <button type="submit" className="bu">Login</button><br></br>
          <span className='s'>Don't have an account?
            <Link to="/signup" className="link"> Sign Up</Link><br />
            <Link to="/forgotpassword" className="link">Forgot Password?</Link>
          </span>
        </form>
        <hr />
        <div className="g-signin-button" onClick={googleLogin}>
          <div className="content-wrapper">
            <img className="google-logo" src="./image.png" alt="google" />
            <span className="button-text">Sign in with Google</span>
          </div>
        </div>
      </div>
      <footer style={{ backgroundColor: "black", color: "white", position: "fixed", bottom: "0", width: "100%", height: "4vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem"}}className='lfooter'>
        <div className="footer">
          <p>©2024 Elite Designs</p>
          <p className="socialmedia">E-mail, Instagram, X</p>
          <p>elitedesigns@gmail.com</p>
        </div>
      </footer>
    </div>
    
  );
  
}

export default Login
