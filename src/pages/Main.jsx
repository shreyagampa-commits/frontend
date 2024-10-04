import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import { API_URL } from '../data/apipath';
import './Main.css'
const Main = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [givenimg, setGivenimg]=useState([]); // State for visibility
  const navigate = useNavigate();
  // const { setPUser } = useContext(UserContext);
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

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
        const userData = await response.json();
        setUser(userData);
          console.log("User Data:", userData);
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

  const handleLogout = () => {
    localStorage.removeItem('logintoken');
    localStorage.removeItem('user');
    navigate('/login');
  };
  const imgpost = (e) => {
    setSelectedFile(e.target.files[0]);
    const files = Array.from(e.target.files); // Previews selected images
    setGivenimg(files.map(file => URL.createObjectURL(file)));
  
      const formData = new FormData();
    files.forEach(file => formData.append('images', file)); // Append each file
  
    fetch(`${API_URL}/vendor/imgvendor/${user.employee._id}`, {
      method: 'POST',
      body: formData, // FormData automatically handles the 'multipart/form-data'
    })
      .then(response => response.json())
      .then(data => {
        console.log('Image upload response:', data); 
      })
      .catch(error => {
        console.error('Error uploading images:', error);
      });
  };
  const delacc = async () => {
    if (!user || !user.employee._id) {
      console.error('User data is not loaded yet');
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/vendor/deletevendor/${user.employee._id}`, {
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
  const onUpload = async () => {
    console.log(selectedFile);
    console.log(user.employee.images.length, user.employee.images[0]);
    // setSelectedFile(user.employee.images[user.employee.images.length-1]);
    if (!selectedFile) {
        console.error('No file selected for upload');
        return;
    }
    console.log('Uploading file:', selectedFile);
    try {
        const formData = new FormData();
        // Append the selected file to the formData object
        formData.append('image', selectedFile);
        console.log('fd',formData); 
        // Make sure to send formData in the body of the fetch request
        const response = await fetch(`http://localhost:4000/vendor/predict/${user.employee._id}`, {
            method: 'POST',
            // body: formData,
        });
        console.log(response,formData);
        // // Check if the response is okay
        if (!response.ok) {
            throw new Error(`Error uploading file: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data.result.node_response.fileName); // Assuming your API returns JSON data
        // const outputPath = data.filename; // Adjust according to your API respons
        setGeneratedImage(`http://localhost:4000/output/${data.result.node_response.fileName}`);
        // console.log('Generated image URL:', outputPath);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
  };
  return (
    <div className='content'>
      <h1>Jewelry Pattern Generator</h1>
      <div className="nav">
        <ul>
          <li><button onClick={handleLogout} className='btns'>Logout</button></li>
          <li><button onClick={()=>navigate('/up')} className='btns'>updatepassword</button></li>
          <li><button onClick={delacc} className='btns'>Delete Account</button></li>
          <li><button className='btns' onClick={()=>{navigate('/profile')}}>Profile</button></li>
          <li><button className='btns' onClick={()=>{navigate('/collections')}}>Collections</button></li>
        </ul>
      </div>

      <div className="content">
        <h1>Main</h1>
        <p>This is the main page.</p>
        {user ? (
          <div>
            <h2>Welcome, {user.employee.username}!</h2>
            <input type="file" onChange={imgpost} multiple />
            <div className="store">{givenimg.map((image, index) => (
                  <img src={image} className="storeimg" height={256} width={256} alt={`Uploaded preview ${index}`} />
            ))}
            { generatedImage ?( <img src={generatedImage} alt="Generated jewelry" />):( null )}
            </div>
            <br></br>
            <button onClick={onUpload}>Upload Sketch</button>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
    </div>
  );
};

export default Main;
