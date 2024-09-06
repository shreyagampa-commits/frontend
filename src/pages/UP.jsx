import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../data/apipath';
import {jwtDecode} from 'jwt-decode';

const UP = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('logintoken');

      if (!token) {
        console.log('No token found, redirecting to login.');
        navigate('/login');
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.vendorid;
        const response = await fetch(`${API_URL}/vendor/singlevendor/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          setUser(userData);
          setIsLoading(false);
        } else {
          throw new Error('Response is not JSON');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };
    fetchUserData();
  }, [navigate]);

  const validate = () => {
    const validationErrors = {};
    // if (!oldPassword) {
    //   validationErrors.oldPassword = "Old password is required";
    // }
    if (!newPassword) {
      validationErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      validationErrors.newPassword = "New password must be at least 8 characters long";
    }
    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }
    return validationErrors;
  };

  const Changepassword = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Ensure user data is loaded before proceeding
    if (!user || !user.employee || !user.employee._id) {
      console.error('User data is not properly loaded');
      alert('User data is not loaded yet. Please wait and try again.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vendor/updatevendor/${user.employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('logintoken')}`
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorResponse.message || 'No error message'}`);
      }

      const data = await response.json();
      console.log(data);
      alert("Password changed successfully");
      navigate('/login');
    } catch (err) {
      console.error('Error changing password:', err);
      alert('Failed to change password. Please try again.');
    }
};



  return (
    <div className="up">
      <div className="container" style={{ width: "100%", backgroundColor: "black" }}>
        <h1>CHANGE PASSWORD</h1>
        <form onSubmit={Changepassword}>
          <label htmlFor="new-password">Enter new password:</label>
          <input 
            type="password" 
            id="new-password" 
            placeholder='Enter new password'
            value={newPassword} 
            onChange={(e) => setNewPassword(e.target.value)} 
          />
          {errors.newPassword && <p style={{ color: 'red' }}>{errors.newPassword}</p>}
          <br></br>
          <label htmlFor="confirm-password">Enter confirm password:</label>
          <input 
            type="password" 
            id="confirm-password"             
            placeholder='Enter confirm password'
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          {errors.confirmPassword && <p style={{ color: 'red' }}>{errors.confirmPassword}</p>}
          
          <button type="submit" disabled={isLoading}>Update</button>
        </form>
      </div>
    </div>
  );
}

export default UP;
