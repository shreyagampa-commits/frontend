import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import './Login.css'
import { API_URL } from '../data/apipath'
import {useGoogleLogin } from '@react-oauth/google';
// import { googleAuth } from '../data/api'
// import { handleError, handleSuccess } from '../utils'
const Login = () => {
  const navigate=useNavigate();
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
  
  return (
    <div className='main'>
      <div className='container' style={{ width: '600px'}}>
        <Link to="/" className='link'>Home</Link>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className='box'>
              <label htmlFor='email'>Email:</label><br></br>
              <input
                  onChange={handleChange}
                  type='email'
                  name='email'
                  autoFocus
                  placeholder='Enter your Email'
                  value={Logininfo.Email}
              />
          </div>
          <div className='box'>
              <label htmlFor='password'>Password:</label><br></br>
              <input
                  onChange={handleChange}
                  type='password'
                  name='password'
                  // autoFocus
                  placeholder='Enter your password'
                  value={Logininfo.password}
              />
          </div>
          <button type='submit' style={{ width: '100px', marginLeft: '10px' , marginTop: '10px', borderRadius: '14px'}}>Login</button>
          <span>Don't have an account?
              <Link to="/signup" className='link'>signup</Link><br></br>
              <Link to="/forgotpassword" className='link'>Forgot Password?</Link>
          </span>
          
        </form>
        {/* <ToastContainer/> */}
        <hr></hr>
        <div class="g-signin-button" onClick={googleLogin}>
        <div class="content-wrapper">
            <img class="google-logo" src="./image.png" alt='google' />
            <span class="button-text">Sign in with Google</span>
        </div>
        </div>
      </div>
    </div>
  )
}

export default Login
