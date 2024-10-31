import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../data/apipath';
import { jwtDecode } from 'jwt-decode'; // Correct import
import { useEffect, useState } from 'react';
import './Collections.css'; // Import the CSS

const Collections = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [bool, setBool] = useState(true);
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
                    if (userData.employee.images.length > 1) {
                      setBool(false);
                  }
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
    const handleDownload = async (imageUrl, imageName) => {
        try {
            const response = await fetch(imageUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', imageName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error downloading the image:', error);
        }
    };
    const handleDeleteImage = async (image) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                const response = await fetch(`${API_URL}/vendor/deleteimage`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('logintoken')}`,
                    },
                    body: JSON.stringify({ image }),
                });
                if (!response.ok) {
                    throw new Error('Failed to delete image');
                }

                // Update the state to remove the deleted image from the UI
                setUser((prevUser) => ({
                    ...prevUser,
                    employee: {
                        ...prevUser.employee,
                        images: prevUser.employee.images.filter((img) => img !== image),
                    },
                }));
                // console.log(user.employee.images.length);
                if (user.employee.images.length > 2) {
                  setBool(false);
                }
                window.location.reload();
                alert('Image deleted successfully');
            } catch (error) {
                console.error('Error deleting the image:', error);
            }
        }
    };
    const handleDeleteAllImages = async () => {
        if (window.confirm('Are you sure you want to delete all images?')) {
            try {
                const response = await fetch(`${API_URL}/vendor/deleteallimages`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('logintoken')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete all images');
                }

                // Update the state to remove all images from the UI
                setUser((prevUser) => ({
                    ...prevUser,
                    employee: {
                        ...prevUser.employee,
                        images: [],
                    },
                }));
                window.location.reload();
                alert('All images deleted successfully');
            } catch (error) {
                console.error('Error deleting all images:', error);
            }
        }
    };
    
    return (
        <div>
            <h1>{user?.employee?.username}'s Jewelry Collections</h1>
            <div className="table">
                <table border="2" cellSpacing="0" cellPadding="5" width={"100%"}>
                    <thead>
                        <tr>
                            <th>S No</th>
                            <th>Sketched Image</th>
                            <th>Colored Image</th>
                            <th>Download Image</th>
                            <th>Delete Image</th>
                        </tr>
                    </thead>
                    {
                        (user?.employee?.images.length === 0)? (<h2>No images uploaded yet</h2>):
                    (<tbody>
                        {Array.isArray(user?.employee?.images) &&
                            user.employee.images.map((image, index) => (
                                <tr key={index}>
                                    <td style={{ fontSize: '40px' }}>{index + 1}</td>
                                    <td>
                                        <img
                                            src={`${API_URL}/uploads/${image}`}
                                            alt="sketch"
                                            width="256"
                                        />
                                    </td>
                                    <td>
                                        <img
                                            src={`${API_URL}/output/${image}`}
                                            alt="colored"
                                            width="256"
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDownload(
                                                    `${API_URL}/output/${image}`,
                                                    image.split('-')[1]
                                                )
                                            }
                                        >
                                            Download
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="delete-button"
                                            onClick={() => handleDeleteImage(image)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                    </tbody>)
                    }
                </table>
            </div>
            {!bool && (
                <button
                    onClick={handleDeleteAllImages}
                    className="delete-all-button"
                    style={{ marginLeft: '110px', width: '200px', height: '40px', backgroundColor: 'red' }}
                >
                    Delete All Images
                </button>
            )}
        </div>
    );
};

export default Collections;
