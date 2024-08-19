import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Correct import for jwt-decode
import { API_URL } from '../data/apipath';

const Main = () => {
  const [user, setUser] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [iv, setIv]=useState(false);
  const [sdImages, setSdImages]=useState([]);
  const [givenimg, setGivenimg]=useState([]); // State for visibility
  const navigate = useNavigate();

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
    const files = Array.from(e.target.files);
    setSelectedImages(files.map(file => URL.createObjectURL(file)));
    setGivenimg(files.map(file => URL.createObjectURL(file)));
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file); // Append each file with key 'images'
    });

    fetch(`${API_URL}/vendor/imgvendor/${user.employee._id}`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        console.log('Image upload response:', data);
        setSelectedImages(data.employee.images.map(image => `${API_URL}/uploads/${image}`));
        // setGivenimg(data.employee.images.map(image => image));
        // myimg(); // Fetch and display images after upload
      })
      .catch(error => {
        console.error('Error uploading images:', error);
      });
  };

  const myimg = async () => {
    setIsVisible(prevIsVisible => !prevIsVisible); // Toggle visibility
    try {
      const response = await fetch(`${API_URL}/vendor/singlevendor/${user.employee._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const userData = await response.json();
        console.log("Fetched User Data:", userData);

        if (userData.employee && Array.isArray(userData.employee.images)) {
          console.log("Image URLs:", userData.employee.images);
          setSelectedImages(userData.employee.images.map(image => `${API_URL}/uploads/${image}`,0));
        } else {
          throw new Error('No images found in the response.');
        }
      } else {
        throw new Error('Response is not JSON.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  };
  const deleteimg =async () => {
    setIv(prevsetIv => !prevsetIv); 
    try {
      const response = await fetch(`${API_URL}/vendor/singlevendor/${user.employee._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const userData = await response.json();
        console.log("Fetched User Data:", userData);

        if (userData.employee && Array.isArray(userData.employee.images)) {
          console.log("Image URLs:", userData.employee.images);
          setSdImages(userData.employee.images.map(image => `${API_URL}/uploads/${image}`));
        } else {
          throw new Error('No images found in the response.');
        }
      } else {
        throw new Error('Response is not JSON.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
    }
  }
  const deleteImage = async (image) => {
    try {
      console.log('Deleting image:', image, 'for user:', user.employee._id);
      // Extract the actual image filename from the full path
      const index = image.indexOf('uploads') + 8; // Adjust to skip the 'uploads' directory in the path
      const imageName = image.slice(index);
      console.log('Deleting image:', imageName, 'for user:', user.employee._id);
  
      // Perform the DELETE request
      const response = await fetch(`${API_URL}/vendor/delimg/${user.employee._id}/${imageName}`, {
        method: 'DELETE', // Correct HTTP method in lowercase
        headers: {
          'Content-Type': 'application/json', // This header is not necessary for DELETE without body, but harmless
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Image deletion response:', data);
  
      // Update selectedImages state to remove the deleted image from the list
      setSelectedImages((prevImages) => prevImages.filter((img) => img !== image));
      setSdImages((prevImages) => prevImages.filter((img) => img !== image));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };
  const deleteAllImages = async () => {
    try {
      const response = await fetch(`${API_URL}/vendor/delimg/${user.employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Image deletion response:', data);
  
      // Reload the page after successful deletion
      window.location.reload();
      
    } catch (error) {
      console.error('Error deleting images:', error);
    }
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
  
  return (
    <div>
      <div className="nav">
        <h1>Jewelry Pattern Generator</h1>
        <ul>
          <li><button onClick={handleLogout}>Logout</button></li>
          <li><button onClick={()=>navigate('/up')}>updatepassword</button></li>
          <li><button onClick={delacc}>Delete Account</button></li>
        </ul>
      </div>

      <div className="content">
        <h1>Main</h1>
        <p>This is the main page.</p>
        {user ? (
          <div>
            <h2>Welcome, {user.employee.username}!</h2>
            <input type="file" onChange={imgpost} multiple />
            {givenimg.map((image, index) => (
          
                  <img src={image} height={200} width={200} alt={`Uploaded preview ${index}`} />
        
              ))}
            <br></br>
            <button onClick={myimg}>Show My Images</button>
            <div className="image-container" style={{ display: isVisible ? 'block' : 'none' }}>
              {selectedImages.map((image, index) => (
   
                  <img src={image} height={200} width={200} alt={`Uploaded preview ${index}`} />
      
              ))}
            </div>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
      </div>
      <div className="deletephotos">
        <button onClick={deleteimg}>All Photos</button>
        <div className="imgdelete" style={{ display: iv ? 'block' : 'none' }}>
              {sdImages.map((image, index) => (
                <div key={index}>
                  <img src={image} height={200} width={200} alt={`Uploaded preview ${index + 1}`} />
                  <button onClick={() => deleteImage(image)}>Delete</button>
                </div>
              ))}
              <button onClick={deleteAllImages}>Delete All Photos</button>
            </div>
      </div>
    </div>
  );
};

export default Main;
