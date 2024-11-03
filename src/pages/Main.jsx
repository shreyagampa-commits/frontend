
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { API_URL } from '../data/apipath';
import './Main.css';

const Main = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [canseletedFile, setCanseletedFile] = useState(null);
    const [cangeneratedImage, setCangeneratedImage] = useState(null);
    const [user, setUser] = useState(null);
    const [geni, setgeni] = useState(false);
    const [loading, setLoading] = useState(false);
    const [canloading, setCanloading] = useState(false);
    const [givenimg, setGivenimg] = useState([]);
    const [lastX,setLastX] = useState(0);
    const [lastY, setLastY] = useState(0);
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isEraser, setIsEraser] = useState(false);
    const [pencilSize, setPencilSize] = useState(1);
    const [eraserSize, setEraserSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasBackgroundColor = "white"; 
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
        // const canvas = canvasRef.current;
        // if (canvas) {
        //     const ctx = canvas.getContext('2d');
        //     ctx.fillStyle = canvasBackgroundColor;
        //     ctx.fillRect(0, 0, canvas.width, canvas.height);
        // }
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            if (canvas) {
                const context = canvas.getContext('2d');
                // Get the smaller dimension to maintain a square shape
                const size = Math.min(canvas.clientWidth, canvas.clientHeight);
                canvas.width = size;
                canvas.height = size; // Set both width and height to maintain square shape
                
                // Clear the canvas and set the background color to white
                context.fillStyle = 'white';
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
            
        };
        
        // Resize on window resize
        window.addEventListener('resize', resizeCanvas);
        
        // Initial resize
        resizeCanvas();
        
        // Cleanup on component unmount
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [navigate]);
    
    
    const handleLogout = () => {
        localStorage.removeItem('logintoken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const imgpost = (e) => {
        setgeni(false);
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
    const processCanvasImage = async () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            console.error('Canvas is not available');
            return;
        }
        setCanloading(true);
        const ctx = canvas.getContext('2d');
    
        // Create a temporary canvas to store the existing drawing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Copy the current drawing onto the temporary canvas
        tempCtx.drawImage(canvas, 0, 0);
    
        // Set white background on the original canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Draw the saved image back on top of the white background
        ctx.drawImage(tempCanvas, 0, 0);
    
        // Convert the updated canvas (with white background and drawing) to a Data URL
        const dataURL = canvas.toDataURL('image/jpg');
    
        // Convert Data URL to Blob
        const blob = await fetch(dataURL).then(res => res.blob());
    
        // Create a File from Blob
        const file = new File([blob], 'canvasimg.jpg', { type: 'image/jpg' });
        setCanseletedFile(file);
    
        // Create FormData object for image upload
        const formData = new FormData();
        formData.append('images', file); // Append the canvas image file
    
        try {
            const response = await fetch(`${API_URL}/vendor/imgvendor/${user.employee._id}`, {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                throw new Error(`Error uploading images: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Image upload response:', data);
    
            // Once the image is successfully uploaded, trigger prediction
            await triggerPrediction(file);
            
        } catch (error) {
            console.error('Error uploading images:', error);
        }
    };
    
    const triggerPrediction = async (file) => {
        try {
            const response = await fetch(`${API_URL}/vendor/predict/${user.employee._id}`, {
                method: 'POST',
                body: JSON.stringify({ fileName: file.name }), // Optionally, send the file name to the prediction endpoint
                headers: {
                    'Content-Type': 'application/json',
                }
            });
    
            if (!response.ok) {
                throw new Error(`Error predicting file: ${response.statusText}`);
            }
    
            const data = await response.json();
            setCangeneratedImage(`${API_URL}/output/${data.result.node_response.fileName}`);
            setCanloading(false);
        } catch (error) {
            console.error('Error during prediction:', error);
        }
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
    const onUpload = async () => {
        if (!selectedFile) {
            console.error('No file selected for upload');
            return;
        }
        setgeni(true);
        setLoading(true);
        try {
            // const formData = new FormData();
            // formData.append('image', selectedFile);

            const response = await fetch(`${API_URL}/vendor/predict/${user.employee._id}`, {
                method: 'POST',
                // body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error uploading file: ${response.statusText}`);
            }

            const data = await response.json();
            setGeneratedImage(`${API_URL}/output/${data.result.node_response.fileName}`);
            setLoading(false);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    const startDrawing = (e) => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = isEraser ? eraserSize : pencilSize;
        ctx.strokeStyle = isEraser ? canvasBackgroundColor : '#000000'; // White for eraser, black for pencil
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext('2d');
        
        // Get the correct position based on the event type
        let offsetX, offsetY;
        if (e.nativeEvent.touches) {
            // Handle touch event
            const touch = e.nativeEvent.touches[0];
            const rect = canvasRef.current.getBoundingClientRect();
            offsetX = touch.clientX - rect.left; // Adjust for canvas position
            offsetY = touch.clientY - rect.top;  // Adjust for canvas position
        } else {
            // Handle mouse event
            offsetX = e.nativeEvent.offsetX;
            offsetY = e.nativeEvent.offsetY;
        }
    
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };
    

    const stopDrawing = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent default touch behavior
        setIsDrawing(true);
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        setLastX(touch.clientX - rect.left);
        setLastY(touch.clientY - rect.top);
    };
    
    const handleTouchMove = (e) => {
        draw(e); // Call the draw function here
    };
    
    const handleTouchEnd = () => {
        setIsDrawing(false);
    };
    // const handleMouseDown = (e) => {
    //     setIsDrawing(true);
    //     const rect = canvasRef.current.getBoundingClientRect();
    //     setLastX(e.clientX - rect.left);
    //     setLastY(e.clientY - rect.top);
    // };
    // const handleMouseMove = (e) => {
    //     draw(e); // Call the draw function here
    // };
    // const handleMouseUp = () => {
    //     setIsDrawing(false);
    // };
    return (
        <div className='content'>
            <h1 className="text-center text-primary mb-4">Jewelry Pattern Generator</h1>
            <div className="d-flex flex-wrap justify-content-center mb-4">
                <button onClick={handleLogout} className='btn btn-danger mx-2 mb-2'>Logout</button>
                <button onClick={() => navigate('/up')} className='btn btn-warning mx-2 mb-2'>Update Password</button>
                <button onClick={delacc} className='btn btn-danger mx-2 mb-2'>Delete Account</button>
                <button className='btn btn-primary mx-2 mb-2' onClick={() => navigate('/profile')}>Profile</button>
                <button className='btn btn-secondary mx-2 mb-2' onClick={() => navigate('/collections')}>Collections</button>
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
                            {(generatedImage && geni) ? (
                                <div className="position-relative m-2">
                                    <img src={generatedImage} alt="Generated jewelry" className="img-thumbnail" height={256} width={256} />
                                    <a href={generatedImage} download={generatedImage.split('-')[1]} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                        &#8681;
                                    </a>
                                </div>
                            ) : (loading && <div className="spinner-border m-5" role="status"></div>)}
                        </div>
                        {/* Upload Sketch Button */}
                        <button onClick={onUpload} className='btn btn-success mt-4'>Upload Sketch</button>
    
                        {/* Drawing Canvas */}
                        <h3 className="mt-5">Draw Your Design</h3>
                        <div className="canvas-container mt-3 d-flex flex-column align-items-center">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={500}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                onMouseLeave={stopDrawing}
                                className="border"
                                style={{ width: '100%', maxWidth: '500px', height: 'auto' }} // Responsive square size
                            />
                            <div className="d-flex flex-wrap justify-content-center mt-2">
                                <button onClick={clearCanvas} className="btn btn-outline-danger me-2 mb-2">Clear Canvas</button>
                                <button onClick={() => setIsEraser(!isEraser)} className="btn btn-outline-secondary mb-2">
                                    {isEraser ? 'Switch to Pencil' : 'Switch to Eraser'}
                                </button>
                            </div>
                            <div className="d-flex flex-wrap justify-content-center mb-2">
                                <label htmlFor="pencilSize" className="form-label me-2">Pencil Size</label>
                                <select
                                    id="pencilSize"
                                    value={pencilSize}
                                    onChange={(e) => setPencilSize(Number(e.target.value))}
                                    className="form-select"
                                    style={{ width: '100px' }}
                                >
                                    <option value={1}>1</option>
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                </select>
                            </div>
                            <div className="d-flex flex-wrap justify-content-center mb-2">
                                <label htmlFor="eraserSize" className="form-label me-2">Eraser Size</label>
                                <select
                                    id="eraserSize"
                                    value={eraserSize}
                                    onChange={(e) => setEraserSize(Number(e.target.value))}
                                    className="form-select"
                                    style={{ width: '100px' }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                            <button onClick={processCanvasImage} className="btn btn-primary mt-4">
                                Process
                            </button>
                        </div>
    
                        {(cangeneratedImage) ? (
                            <div className="position-relative m-2">
                                <img src={cangeneratedImage} alt="Generated jewelry" className="img-thumbnail" height={256} width={256} />
                                <a href={cangeneratedImage} download={cangeneratedImage.split('-')[1]} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                    &#8681;
                                </a>
                            </div>
                        ) : (canloading && <div className="spinner-border m-5" role="status"></div>)}
                    </div>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
        </div>
    );
};

export default Main;
