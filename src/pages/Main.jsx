import React, { useState } from 'react';
import axios from 'axios';
import '../css/Main.css'; // Ensure your CSS file is correctly linked
import backgroundImage from '../img/uploadpic1.png'; // Ensure the background image path is correct

const Main = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) {
            alert("Please select an image to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        setLoading(true);

        try {
            const response = await axios.post("http://localhost:8002/generate", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                responseType: "blob",
            });

            const url = URL.createObjectURL(response.data);
            setGeneratedImage(url);
        } catch (error) {
            console.error("Error uploading or generating image:", error);
            alert("Failed to generate image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="container"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column'
            }}
        >
            {/* Title inside the container */}
            <div style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
                Upload your images here
            </div>

            <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ marginBottom: '20px' }}
                />
                <button type="submit" disabled={loading}>Generate Image</button>
            </form>

            {selectedFile && generatedImage && (
                <div className="image-container">
                    
                    <div className="images-wrapper">
                        <div className="image-box">
                            <h3>Uploaded Image:</h3>
                            <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Uploaded"
                                className="image"
                            />
                        </div>
                        <div className="image-box">
                            <h3>Generated Image:</h3>
                            <img
                                src={generatedImage}
                                alt="Generated"
                                className="image"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;