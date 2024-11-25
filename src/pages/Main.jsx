// src/pages/Main.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; // Corrected import
import { API_URL } from '../data/apipath';
import '../css/Main.css';

const Main = () => {
    const [navOpen, setNavOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [canseletedFile, setCanseletedFile] = useState(null);
    const [cangeneratedImage, setCangeneratedImage] = useState(null);
    const [gen, setGen] = useState(false);
    const [user, setUser] = useState(null);
    const [geni, setgeni] = useState(false);
    const [loading, setLoading] = useState(false);
    const [canloading, setCanloading] = useState(false);
    const [givenimg, setGivenimg] = useState([]); // State for visibility
    // const [outputImages, setOutputImages] = useState([]);
    // const [isEraser, setIsEraser] = useState(false);
    // const [isDrawing, setIsDrawing] = useState(false);
    // const [lastX, setLastX] = useState(0);
    // const [lastY, setLastY] = useState(0);
    // const canvasRef = useRef(null); // Reference for the canvas
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
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = canvasBackgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
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
        if(files[0]==null){
            setGen(false);
        }else{
            setGen(true);
        }
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
            const response = await fetch(`${API_URL}/vendor/gold/${user.employee._id}`, {
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

            const response = await fetch(`${API_URL}/vendor/${selectedValue}/${user.employee._id}`, {
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

    // Drawing functions
    // const startDrawing = (e) => {
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     const rect = canvas.getBoundingClientRect();
    //     setIsDrawing(true);
    //     setLastX(e.clientX - rect.left);
    //     setLastY(e.clientY - rect.top);
    //     ctx.beginPath();
    //     ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    // };

    // const draw = (e) => {
    //     if (!isDrawing) return;
    //     const canvas = canvasRef.current;
    //     const ctx = canvas.getContext('2d');
    //     const rect = canvas.getBoundingClientRect();
    //     const x = e.clientX - rect.left;
    //     const y = e.clientY - rect.top;

    //     ctx.lineWidth = 5;
    //     ctx.lineCap = 'round';
    //     ctx.strokeStyle = isEraser ? 'white' : 'black';

    //     ctx.lineTo(x, y);
    //     ctx.stroke();
    //     setLastX(x);
    //     setLastY(y);
    // };

    // const stopDrawing = () => {
    //     setIsDrawing(false);
    // };
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
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
    };
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
    const clearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    const handleTouchStart = (e) => {
        e.preventDefault(); // Prevent default touch behavior
        const touch = e.touches[0];
        const rect = canvasRef.current.getBoundingClientRect();
        const offsetX = touch.clientX - rect.left;
        const offsetY = touch.clientY - rect.top;
        startDrawing({ nativeEvent: { offsetX, offsetY } });
    };
    
    const handleTouchMove = (e) => {
        e.preventDefault(); // Prevent default touch behavior
        draw(e); // Call the draw function here
    };
    
    const handleTouchEnd = () => {
        stopDrawing(); // Ensure the drawing stops when touch ends
    };
    const rgen=()=>{
        setgeni(true);
        const randomIndex = Math.floor(Math.random() * 24)+1;
        setGeneratedImage(`${API_URL}/rcimg/s${randomIndex}.png`);
        setGivenimg([`${API_URL}/rsimg/s${randomIndex}.png`]);
    }
    const [selectedValue, setSelectedValue] = useState('gold'); 
    const handleChange = (event) => {
    setSelectedValue(event.target.value);
    };
    return (
        <div className='content'>
            <header>
            <nav id="nav" className="nav">
            <div className="logo" id="logo">Elite Designs</div>
          <button
          className="hamburger"
          onClick={() =>{ setNavOpen(!navOpen);}}
          aria-expanded={navOpen}
          aria-controls="navitems"
        >
          ☰
        </button>
          <div className={!navOpen ? 'navitems' : 'notnavitems'} id="navitems">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/explore">Explore</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
              <button className='btn btn-warning mx-2 mb-2' onClick={() => navigate('/collections')}>My Collections</button>
            </ul>
          </div>
                <div className="dropdown">
                    <button className="drop-down" />
                    <div className="dropdown-content">
                    {/* <Link to="/"><span id="user-details">User</span></Link> */}
                    <button className='btn btn-primary mx-2 mb-2' onClick={() => navigate('/profile')}>Profile</button>
                    {/* <button to="/" id="logout-link">Logout</button> */}
                    <button onClick={handleLogout} className='btn btn-danger mx-2 mb-2'>Logout</button>
                    </div>
                </div>
                </nav>
            </header>
        
            <div className="main-container" style={{ marginTop: '25px',marginBottom: '25px'}}>
            <h1 className="text-center text-white mb-4 mt-4">AI-Driven Jewelry Transforming Sketches into Stunning Creations</h1>
                <p className="text-center text-white mb-4 mt-4 fw-bold f">Welcome, {user ? user.employee.username : 'User'}!</p>
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
                            <p className="text-center">Drag and Drop or click to upload your high resolution pencil sketch image</p>
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
                                    <img src={image} className="storeimg img-thumbnail" height={300} width={300} alt={`Uploaded preview ${index}`} />
                                    {/* Download Button */}
                                    <p href={image} onClick={()=>handleDownload(image, "uploaded_preview")} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                        &#8681;
                                    </p>
                                </div>
                            ))}
                            {(generatedImage && geni) ? (
                                <div className="position-relative m-2">
                                    <img src={generatedImage} alt="Generated jewelry" className="img-thumbnail" height={300} width={300} />
                                    <p href={generatedImage} onClick={()=>handleDownload(generatedImage, "generated_jewelryimg")} className="btn btn-sm btn-outline-primary position-absolute top-0 end-0 m-1">
                                        &#8681;
                                    </p>
                                </div>
                            ) : (loading && <div className="spinner-border m-5" role="status"></div>)}
                        </div>
                        {/* Upload Sketch Button */}
                        <select value={selectedValue} onChange={handleChange} className={`dd ${!gen? 'd-none' : ''}`}>
                        <option value="gold">GOLD</option>
                        <option value="silver">SILVER</option>
                        {/* <option value="Option 3">Option 3</option> */}
                        </select>
                       <button onClick={onUpload} className={`btn btn-success mt-4 mb-4 ${!gen? 'd-none' : ''}`}>Upload Sketch</button>
                        <button onClick={rgen} className={`btn btn-success mt-4 mb-4 ${gen? 'd-none' : ''}`}>Random IMG generate</button>
                        {/* Drawing Canvas */}
                        {/* <h3 className="mt-5">Draw Your Design</h3>
                        <div className="canvas-container mt-3 d-flex flex-column align-items-center">
                            <canvas
                                ref={canvasRef}
                                width={500}
                                height={500}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
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
                    
                    */}
                    </div>
                ) : (
                    <p>Loading user details...</p>
                )}
            </div>
            
            <footer style={{ backgroundColor: "black", color: "white", position: "fixed", bottom: "0", width: "100%", height: "4vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem"}}className='lfooter'>
        <div className="footer">
          <p>©2024 Elite Designs</p>
          <p className="socialmedia">E-mail, Instagram, X</p>
          <p>elitedesigns@gmail.com</p>
        </div>
      </footer>
        </div>
    );
    
};

export default Main;