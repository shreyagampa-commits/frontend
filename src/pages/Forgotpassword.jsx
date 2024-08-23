import React, { useState } from 'react';
import { API_URL } from '../data/apipath';
import { useNavigate } from 'react-router-dom';
// import bcrypt from 'bcryptjs';

const Forgotpassword = () => {
    const navigate = useNavigate();
    const [userid, setUserid] = useState('nouser');
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const sendOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/vendor/allvendor?email=${encodeURIComponent(loginInfo.email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            const data = await res.json();

            const user = data.employees.find(employee => employee.email === loginInfo.email);
            if (user) {
                setUserid(user._id);
                const otpSent = await otpCaller();
                if (otpSent) {
                    alert("OTP sent successfully");
                    setOtpSent(true);
                }
            } else {
                alert("User does not exist");
                setLoginInfo(prevState => ({ ...prevState, email: '' }));
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while sending OTP.');
        }
    };

    const otpCaller = async () => {
        try {
            const res = await fetch(`${API_URL}/vendor/forgot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: loginInfo.email })
            });
            const data = await res.json();
            localStorage.setItem('loginToken', data.token);
            return data.success;
        } catch (err) {
            console.error(err);
            return false;
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { otp } = loginInfo;

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

            try {
                const res = await fetch(`${API_URL}/vendor/comparepassword`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        otp,
                        byotp: data.employee.otp
                    })
                });
                const newdata = await res.json();
                if (newdata.success) {
                    alert('OTP verified successfully');
                    navigate('/up');
                } else {
                    alert('Incorrect OTP');
                    setLoginInfo(prevState => ({ ...prevState, otp: '' }));
                }

            } catch (err) {
                console.error(err);
                alert('An error occurred while verifying OTP.');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred while retrieving user data.');
        }
    };

    return (
        <div>
            <h1>Forgot Password</h1>
            <form onSubmit={handleLogin}>
                <div className='box'>
                    <label htmlFor='email'>Email:</label><br />
                    <input
                        onChange={handleChange}
                        type='email'
                        name='email'
                        autoFocus
                        placeholder='Enter your email'
                        value={loginInfo.email}
                        required
                    />
                </div>
                <button onClick={sendOtp} disabled={otpSent}>Send OTP</button>
                <div className='box'>
                    <label htmlFor='otp'>OTP:</label><br />
                    <input
                        onChange={handleChange}
                        type='password'
                        name='otp'
                        placeholder='Enter your OTP'
                        value={loginInfo.otp}
                        required
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    );
};

export default Forgotpassword;
