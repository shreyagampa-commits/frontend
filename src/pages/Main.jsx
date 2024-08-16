import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import { API_URL } from '../data/apipath';

const Main = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('logintoken');
    
      if (!token) {
        // console.log('No token found, redirecting to login.');
        navigate('/login');
        return;
      }

      try {
        // Decode the token to get user details
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.vendorid;  // Adjust based on your token payload
        // console.log("user id : ",userId)
        // console.log("token : ",decodedToken)
        const response = await fetch(`${API_URL}/vendor/singlevendor/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // mode: 'cors',
          // credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // console.log("response : ",response)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const userData = await response.json();
          setUser(userData);
          // console.log("user data : ",userData);
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

  const handleProfile = () => {
    const content = document.querySelector('.content');
    content.style.display = content.style.display === 'none' ? 'block' : 'none';
  };

  const handleLogout = () => {
    localStorage.removeItem('logintoken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div>
      <div className="nav">
        <h1>Jewelry Pattern Generator</h1>
        <ul>
          <li><button onClick={handleLogout}>Logout</button></li>
          <li><button onClick={handleProfile}>Profile</button></li>
        </ul>
      </div>

      <div className="content" style={{ display: 'none' }}>
        <h1>Main</h1>
        <p>This is the main page.</p>
        {user ? (
          <div>
            <h2>Welcome, {user.employee.username}!</h2>
            <p>Email: {user.employee.password}</p>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
    </div>
  );
};

export default Main;
