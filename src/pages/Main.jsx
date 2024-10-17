// src/pages/Main.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { API_URL } from '../data/apipath';
import './Main.css';

const Main = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [user, setUser] = useState(null);
    const [givenimg, setGivenimg] = useState([]); // State for visibility
    const [outputImages, setOutputImages] = useState([]);
    const [isEraser, setIsEraser] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastX, setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const canvasRef = useRef(null); // Reference for the canvas
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
                setUser(userData);
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
        setGivenimg(files.map(file => URL.createObjectURL(file)));

        // Set the selected file to state
        setSelectedFile(files[0]); // Assuming you want to use the first file

        const formData = new FormData();
        files.forEach(file => formData.append('images', file)); // Append each file

        fetch(`${API_URL}/vendor/imgvendor/${user.employee._id}`, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Image upload response:', data);
            })
            .catch(error => {
                console.error('Error uploading images:', error);
            });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        setGivenimg(files.map(file => URL.createObjectURL(file)));

        // Optionally set the first file as selectedFile
        setSelectedFile(files[0]);

        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        fetch(`${API_URL}/vendor/imgvendor/${user.employee._id}`, {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                console.log('Image upload response:', data);
            })
            .catch(error => {
                console.error('Error uploading images:', error);
            });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
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

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setGivenimg(files.map(file => URL.createObjectURL(file)));
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const onUpload = async () => {
        if (!selectedFile) {
            console.error('No file selected for upload');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(`${API_URL}/vendor/predict/${user.employee._id}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.statusText}`);
            }

            const data = await response.json();
            setGeneratedImage(`${API_URL}/output/${data.result.node_response.fileName}`);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    // Drawing functions
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        setIsDrawing(true);
        setLastX(e.clientX - rect.left);
        setLastY(e.clientY - rect.top);
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isEraser ? 'white' : 'black';

        ctx.lineTo(x, y);
        ctx.stroke();
        setLastX(x);
        setLastY(y);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    return (
        <div className='content'>
            <h1 className="text-center text-primary mb-4">Jewelry Pattern Generator</h1>
            <div className="d-flex justify-content-center mb-4">
                <button onClick={handleLogout} className='btn btn-danger mx-2'>Logout</button>
                <button onClick={() => navigate('/up')} className='btn btn-warning mx-2'>Update Password</button>
                <button onClick={delacc} className='btn btn-danger mx-2'>Delete Account</button>
                <button className='btn btn-primary mx-2' onClick={() => navigate('/profile')}>Profile</button>
                <button className='btn btn-secondary mx-2' onClick={() => navigate('/collections')}>Collections</button>
            </div>

            <div className="container">
                <h2 className="text-center mb-4">Welcome, {user ? user.employee.username : 'User'}!</h2>
                {user ? (
                    <div className="text-center">
                        {/* Drag and Drop Area */}
                        <label
                            htmlFor="fileInput"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border border-dashed p-4 mb-4"
                            style={{ backgroundColor: '#e9ecef', borderRadius: '10px', cursor: 'pointer' }}
                        >
                            <h5 className="text-center">Drag and Drop your files here or click to upload</h5>
                            <input
                                type="file"
                                id="fileInput"
                                onChange={imgpost}
                                multiple
                                className="form-control-file d-none"
                            />
                        </label>

                        {/* Image Previews */}
                        <div className="store d-flex justify-content-center flex-wrap">
                            {givenimg.map((image, index) => (
                                <div key={index} className="position-relative m-2">
                                    <img src={image} className="storeimg img-thumbnail" height={256} width={256} alt={`Uploaded preview ${index}`} />
                                    {/* Download Button */}
                                    <a href={image} download={`uploaded_image_${index}.png`} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                        &#8681;
                                    </a>
                                </div>
                            ))}
                            {generatedImage && (
                            
                                <div className="position-relative m-2">
                                    <img src={generatedImage} alt="Generated jewelry" className="img-thumbnail" height={256} width={256} />
                                    <a href={generatedImage} download={generatedImage.split('-')[1]} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                        &#8681;
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Upload Sketch Button */}
                        <button onClick={onUpload} className='btn btn-success mt-4'>Upload Sketch</button>

                        {/* Drawing Canvas */}
                        <h3 className="mt-5">Draw Your Design</h3>
                        <div className="canvas-container mt-3">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={500}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                className="border"
                            />
                            <div className="mt-2">
                                <button onClick={clearCanvas} className='btn btn-outline-danger me-2'>Clear Canvas</button>
                                <button onClick={() => setIsEraser(!isEraser)} className='btn btn-outline-secondary'>
                                    {isEraser ? 'Switch to Pencil' : 'Switch to Eraser'}
                                </button>
                            </div>
                        </div>

                        {/* Download Generated Image */}
                        {generatedImage && (
                            <div className="mt-4">
                                <h4>Download Generated Image:</h4>
                                <a href={generatedImage} download="generated_jewelry.png" className="btn btn-primary">Download</a>
                            </div>
                        )}
                    </div>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
        </div>
    );
};

export default Main;
