import React, { useState } from 'react';
import { API_URL } from '../data/apipath';
import { useNavigate } from 'react-router-dom';
// import bcrypt from 'bcryptjs';
const Forgotpassword = () => {
  const Navigate = useNavigate();
    const [userid, setuserid] = useState('nouser');
    const [Logininfo, setLogininfo] = useState({
        email: '',
        otp: ''
    });
    const [otpSent, setOtpSent] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLogininfo(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const sendotp = async (e) => {
        e.preventDefault();
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
                // alert("User exists");
                const otpSent = await otpcaller();
                if (otpSent) {
                    alert("OTP sent successfully");
                    setOtpSent(true);
                }
            } else {
                alert("User does not exist");
                setLogininfo(prevState => ({ ...prevState, email: '' }));
            }

            if (data.status === 200) {
                alert(data.message);
            }
        } catch (err) {
            console.log(err);
            alert('An error occurred while sending OTP.');
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
            localStorage.setItem('logintoken',data.token)
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
            console.log(data.employee.otp, otp);
            try{
                const res = await fetch(`${API_URL}/vendor/comparepassword`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        otp: otp,
                        byotp:data.employee.otp
                    })
                });
                const newdata = await res.json();
                if(newdata.success){
                    alert('OTP verified successfully');
                    Navigate('/up');
                }
                else{
                    alert('Incorrect OTP');
                    setLogininfo(prevState => ({ ...prevState, otp: '' }));
                }

            }catch(err){
                console.log(err);
            }
        } catch (err) {
            console.log(err);
            alert('An error occurred while verifying OTP.');
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
                        value={Logininfo.email}
                        required
                    />
                </div>
                <button onClick={sendotp} disabled={otpSent}>Send OTP</button>
                <div className='box'>
                    <label htmlFor='otp'>OTP:</label><br />
                    <input
                        onChange={handleChange}
                        type='password'
                        name='otp'
                        placeholder='Enter your OTP'
                        value={Logininfo.otp}
                        required
                    />
                </div>
                <button type='submit'>Login</button>
            </form>
        </div>
    );
};

export default Forgotpassword;
