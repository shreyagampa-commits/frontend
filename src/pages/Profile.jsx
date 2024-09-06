import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../data/apipath';
import {jwtDecode} from 'jwt-decode';


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
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <h1>PROFILE INFO</h1>
    <div className="profile-container">
      <h2>Welcome, {user.username}!</h2>
      <form>
        <label htmlFor="username">Username:</label>
        <div id='pro'>{user.username}</div>
        <br />
        <label htmlFor="email">Email:</label>
        <div id='pro'>{user.email}</div>
      </form>
    </div>
    </div>
  );
};

export default Profile;
