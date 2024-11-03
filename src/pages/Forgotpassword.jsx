import React, { useEffect, useRef, useState } from 'react';
import { API_URL } from '../data/apipath';
import { useNavigate } from 'react-router-dom';


const Forgotpassword = () => {
  const Navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [userid, setuserid] = useState('nouser');
  const [Logininfo, setLogininfo] = useState({
    email: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const inputref = useRef([]);

  useEffect(() => {
    if (inputref.current[0]) {
      inputref.current[0].focus();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogininfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const sendotp = async (e) => {
    e.preventDefault();
    if(Logininfo.email.search("@")===-1){
      try {
        const res = await fetch(`${API_URL}/vendor/allvendor?phone=${encodeURIComponent(Logininfo.email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();

        const user = data.employees.find(employee => employee.phone === Logininfo.email);
        if (user) {
          setuserid(user._id);
          const otpSent = await otpcaller();
          if (otpSent) {
            alert("OTP sent successfully");
            setOtpSent(true);
            document.querySelector('.sbtn').style.display = 'block';
          }
        } else {
          alert(" phone User does not exist");
          setLogininfo(prevState => ({ ...prevState, email: '' }));
        }
      } catch (err) {
        console.log(err);
        alert('An error occurred while sending OTP.');
      }
    }
    else{
      try {
        const res = await fetch(`${API_URL}/vendor/allvendor?email=${encodeURIComponent(Logininfo.email)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();

        const user = data.employees.find(employee => employee.email === Logininfo.email);
        if (user) {
          setuserid(user._id);
          const otpSent = await otpcaller();
          if (otpSent) {
            alert("OTP sent successfully");
            setOtpSent(true);
            document.querySelector('.sbtn').style.display = 'block';
          }
        } else {
          alert("User does not exist");
          setLogininfo(prevState => ({ ...prevState, email: '' }));
        }
      } catch (err) {
        console.log(err);
        alert('An error occurred while sending OTP.');
      }
  }
  };

  const otpcaller = async () => {
    try {
      const res = await fetch(`${API_URL}/vendor/forgot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: Logininfo.email })
      });
      const data = await res.json();
      localStorage.setItem('logintoken', data.token);
      return data.success;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { otp } = Logininfo;

    if (!otp) {
      alert('Please fill all the fields');
      return;
    }
    if (userid === 'nouser') {
      alert('User does not exist');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/vendor/singlevendor/${userid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const data = await res.json();
      const otpComparisonRes = await compareOtp(data.employee.otp, otp);
      if (otpComparisonRes) {
        alert('OTP verified successfully');
        Navigate('/up');
      } else {
        alert('Incorrect OTP');
        setLogininfo(prevState => ({ ...prevState, otp: '' }));
      }
    } catch (err) {
      console.log(err);
      alert('An error occurred while verifying OTP.');
    }
  };

  const compareOtp = async (storedOtp, enteredOtp) => {
    try {
      const res = await fetch(`${API_URL}/vendor/comparepassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp: enteredOtp,
          byotp: storedOtp
        })
      });
      const data = await res.json();
      return data.success;
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const hc = (index, e) => {
    const value = e.target.value;
    if (isNaN(value)) {
      return;
    }
    const newotp = [...otp];
    newotp[index] = value.substring(value.length - 1);
    setOtp(newotp);
    const cotp = newotp.join('');
    setLogininfo(prevState => ({ ...prevState, otp: cotp }));

    // Focus the next input field
    if (value !== "" && index < otp.length - 1) {
      inputref.current[index + 1].focus();
    }
  };

  const hclick = (index) => {
    // Clear the current input field and focus it
    const newotp = [...otp];
    newotp[index] = "";
    setOtp(newotp);
    inputref.current[index].focus();
  };

  const hkey = (index, e) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      // Focus the previous input field on backspace if the current one is empty
      inputref.current[index - 1].focus();
    }
  };
      
  return (
    <div className='container'>
      <h1>Forgot Password</h1>
      <form onSubmit={handleLogin}>
        <div className='box'>
          <label htmlFor='email'>Email:</label><br />
          <input style={{border: '1px solid blue'}}
            onChange={handleChange}
            type='email'
            name='email'
            autoFocus
            className='emailinput'
            placeholder='Enter your email '
            value={Logininfo.email}
            required
          />
        </div>
        <button onClick={sendotp} disabled={otpSent}>Send OTP</button>
        {otpSent && (
          <div className='box'>
            <label htmlFor='otp'>OTP:</label><br />
            <div className="value">
              {otp.map((value, index) => (
                <input
                  key={index}
                  ref={(input) => (inputref.current[index] = input)}
                  onChange={(e) => hc(index, e)}
                  onClick={() => hclick(index)}
                  onKeyDown={(e) => hkey(index, e)}
                  type='text'
                  className='otpinput'
                  value={value}
                  required
                />
              ))}
            </div>
          </div>
        )}
        <br />
        <button className='sbtn' style={{ display: 'none' }} type='submit'>Login</button>
      </form>
    </div>
  );
};

export default Forgotpassword;
