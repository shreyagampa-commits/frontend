import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import '../css/Login.css'
import { API_URL } from '../data/apipath'
// import { handleError, handleSuccess } from '../utils'
const Signup = () => {
  const navigate=useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [signupinfo, setsignupInfo] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const handleChange = (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    // console.log(name, value);
    const copysignupinfo = { ...signupinfo };
    copysignupinfo[name] = value;
    setsignupInfo(copysignupinfo);
  }
  // console.log(signupinfo);
  const handleSignup =async(e,req,res) => {
    e.preventDefault();
    // console.log(signupinfo);
    const { username,email, password, confirmPassword } = signupinfo;
    if(!username || !password || !confirmPassword || !email) {
      return alert('Fill the details')

    }
    else if(password !== confirmPassword){
      return alert('password not matched')
    }
    try{
      const res = await fetch(`${API_URL}/vendor/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupinfo)
      })
      const result= await res.json();

      const {msg,success,err}=result;
      if(success){
        window.confirm('signup successfully');
        setTimeout(()=>{
          navigate('/login')
        },1000)
        setsignupInfo({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
      }else if(err){
        const details=err?.details[0].msg;
        alert(details)
      }else if(!success){
        alert(msg);
      }
      // navigate('/register')
    }catch(err){
      // alert('user already exist');
      console.log(err);
    }
  }
  const [showPassword1, setShowPassword1] = useState(false);

  // Function to toggle password visibility
  const togglePassword1 = () => {
    setShowPassword1(!showPassword1);
  };
  const [showPassword2, setShowPassword2] = useState(false);

  // Function to toggle password visibility
  const togglePassword2 = () => {
    setShowPassword2(!showPassword2);
  };
  return (
    <div className='body'>
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
      <div className='containerlogin'>
      {/* <Link to="/" className='link h'>Home</Link> */}
        <h2 className='heading'>Signup</h2>
        <form onSubmit={handleSignup} id="loginform">
          <div className='details'>
              <label htmlFor='username'>Username:</label><br></br>
              <input
                  onChange={handleChange}
                  type='text'
                  name='username'
                  autoFocus
                  placeholder='Enter username'
                  value={signupinfo.username}
              />
          </div>
          <div className='details'>
              <label htmlFor='email'>Email:</label><br></br>
              <input
                  onChange={handleChange}
                  type='email'
                  name='email'
                  autoFocus
                  placeholder='Enter your email'
                  value={signupinfo.email}
              />
          </div>
          <div className='details'>
              <label htmlFor='password'>Password:</label><br></br>
              <input
                  onChange={handleChange}
                  type={showPassword1 ? 'text' : 'password'}
                  name='password'
                  autoFocus
                  placeholder='Enter password'
                  value={signupinfo.password}
              />
              <button type="button" className="toggle-password1" style={{width:"fit-content"}} onClick={togglePassword1}>
              {showPassword1 ? <i className="fas fa-eye-slash a"></i> : <i className="fas fa-eye a"></i>}
            </button>
          </div>

          <div className='details'>
              <label htmlFor='confirmPassword'>Confirm Password:</label><br></br>
              <input
                  onChange={handleChange}
                  type={showPassword2 ? 'text' : 'password'}
                  name='confirmPassword'
                  autoFocus
                  placeholder='Re-Enter password'
                  value={signupinfo.confirmPassword}
              />
              <button type="button" className="toggle-password2" style={{width:"fit-content"}} onClick={togglePassword2}>
                {showPassword2 ? <i className="fas fa-eye-slash a"></i> : <i className="fas fa-eye a"></i>}
              </button>
          </div>
          <button type='submit'className='bu'>Signup</button>
          <span className='s'>Already have an account?
              <Link to="/login" className='link'>Login</Link>
          </span>
        </form>
        {/* <ToastContainer/> */}
      </div>
      <footer style={{ backgroundColor: "black", color: "white", position: "fixed", bottom: "0", width: "100%", height: "4vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem"}}className='lfooter'>
        <div className="footer">
          <p>©2024 Elite Designs</p>
          <p className="socialmedia">E-mail, Instagram, X</p>
          <p>elitedesigns@gmail.com</p>
        </div>
      </footer>
    </div>
  )
}

export default Signup;
