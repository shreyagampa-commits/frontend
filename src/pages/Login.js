import React from 'react'
import { Link , useNavigate} from 'react-router-dom'
// import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useState } from 'react'
import './Login.css'
import { API_URL } from '../data/apipath'
// import { handleError, handleSuccess } from '../utils'
const Login = () => {
  const navigate=useNavigate();
  const [Logininfo, setLoginInfo] = useState({
    username: '',
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
    const { username, password} = Logininfo;
    if(!username || !password) {
      return alert('Fill the details')
    }try{
      const res = await fetch(`${API_URL}/vendor/login`, {
        method: 'POST',
        headers: {
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
          username: '',
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
  return (
    <div className='main'>
      <div className='container'>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div className='box'>
              <label htmlFor='username'>Username:</label><br></br>
              <input
                  onChange={handleChange}
                  type='text'
                  name='username'
                  autoFocus
                  placeholder='Enter your name'
                  value={Logininfo.username}
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
          <button type='submit'>Login</button>
          <span>Don't have an account?
              <Link to="/signup" className='link'>signup</Link>
          </span>
        </form>
        {/* <ToastContainer/> */}
      </div>
    </div>
  )
}

export default Login
