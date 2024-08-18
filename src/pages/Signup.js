import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import './Login.css'
import { API_URL } from '../data/apipath'
// import { handleError, handleSuccess } from '../utils'
const Signup = () => {
  const navigate=useNavigate();
  const [signupinfo, setsignupInfo] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  const handleChange = (e) => {
    // e.preventDefault();
    const { name, value } = e.target;
    console.log(name, value);
    const copysignupinfo = { ...signupinfo };
    copysignupinfo[name] = value;
    setsignupInfo(copysignupinfo);
  }
  console.log(signupinfo);
  const handleSignup =async(e) => {
    e.preventDefault();
    // console.log(signupinfo);
    const { username, password, confirmPassword } = signupinfo;
    if(!username || !password || !confirmPassword) {
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
      }).then((res) => res.json())
      // console.log(res);
      const result= await res.json();
      // console.log(result);
      const {msg,success,err}=result;
      if(success){
        window.confirm('signup successfully');
        setTimeout(()=>{
          navigate('/login')
        },1000)
        setsignupInfo({
          username: '',
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
  return (
    <div className='main'>
      <div className='container'>
      <Link to="/" className='link'>Home</Link>
        <h1>Signup</h1>
        <form onSubmit={handleSignup}>
          <div className='box'>
              <label htmlFor='username'>Username:</label><br></br>
              <input
                  onChange={handleChange}
                  type='text'
                  name='username'
                  autoFocus
                  placeholder='username'
                  value={signupinfo.username}
              />
          </div>
          <div className='box'>
              <label htmlFor='password'>Password:</label><br></br>
              <input
                  onChange={handleChange}
                  type='password'
                  name='password'
                  autoFocus
                  placeholder='password'
                  value={signupinfo.password}
              />
          </div>

          <div className='box'>
              <label htmlFor='confirmPassword'>Confirm Password:</label><br></br>
              <input
                  onChange={handleChange}
                  type='password'
                  name='confirmPassword'
                  autoFocus
                  placeholder='password'
                  value={signupinfo.confirmPassword}
              />
          </div>
          <button type='submit'>Signup</button>
          <span>Already have an account?
              <Link to="/login" className='link'>Login</Link>
          </span>
        </form>
        {/* <ToastContainer/> */}
      </div>
    </div>
  )
}

export default Signup;