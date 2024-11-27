import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../data/apipath';
import {jwtDecode} from 'jwt-decode';
import '../css/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
  });
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('logintoken');
      try {
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.vendorid;
        console.log("User ID:", userId);
        console.log("Decoded Token:", decodedToken);

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
        const userData = await response.json();
        setUser({username: userData.employee.username, email: userData.employee.email});
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/main');
      }
    };
    fetchUserData();
  }, [navigate]);
  const delacc = async () => {
    const id=jwtDecode(localStorage.getItem('logintoken')).vendorid;
    if (!id) {
        console.error('User data is not loaded yet');
        return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/vendor/deletevendor/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('logintoken')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Account deletion response:', data);

        // After account deletion, log the user out and navigate to the login page
        localStorage.removeItem('logintoken');
        navigate('/login');
    } catch (error) {
        console.error('Error deleting account:', error);
    }
  };
  return (
    <div className='conten'>
      <div className="profile-container">
        <h1>PROFILE INFO</h1>
        <h2>Welcome, {user.username}!</h2>
        <form>
          <label htmlFor="username">Username:</label>
          <div id='pro'>{user.username}</div>
          <br />
          <label htmlFor="email">Email:</label>
          <div id='pro'>{user.email}</div>
        </form>
        <button onClick={() => navigate('/up')} className='pb mx-2 mb-2'>Update Password</button>
        <button onClick={delacc} className='pb mx-2 mb-2'>Delete Account</button>
      </div>
    </div>
  );
};

export default Profile;
