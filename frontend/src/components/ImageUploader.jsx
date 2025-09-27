import React, { useState, useRef } from 'react';
import './ImageUploader.css';
import { FaUpload, FaCamera } from "react-icons/fa";

const ImageUploader = () => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // 1. Add new state for loading and the analysis result
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleUploadClick = () => {
    inputRef.current.click();
  };

  const handleFileChange = (event) => {
    setAnalysisResult(null); // Clear previous results
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // 2. Create the function to send the file to the backend
  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAnalysisResult(data); // Store the result from the backend
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      alert('Error: Could not get analysis from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Create a function to cancel and reset the view
  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setAnalysisResult(null);
  };
  
  return (
    <div className="container">
      <header className="header">
        <div className="logo">A</div>
        <h2>AgroAI</h2>
      </header>

      <main className="uploader-card">
        {preview ? (
          <div className="preview-section">
            <img src={preview} alt="Selected crop" className="image-preview" />
            
            {/* 4. Show loading message or the final result */}
            {isLoading && <p>Analyzing, please wait...</p>}
            {analysisResult && (
              <div className="result-section">
                <strong>Disease:</strong> {analysisResult.disease} <br/>
                <strong>Confidence:</strong> {(analysisResult.confidence * 100).toFixed(2)}%
              </div>
            )}

            <div className='button-group'>
                {/* 5. Wire up the new functions to the buttons */}
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="upload-section">
            <h1>Analyze Your Crops</h1>
            <p>Upload or capture a photo to get AI-powered agricultural insights</p>
            <input type="file" ref={inputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*"/>
            <button className="btn btn-primary" onClick={handleUploadClick}>
              <FaUpload /> Upload a Photo
            </button>
            <button className="btn btn-secondary">
              <FaCamera /> Capture a Photo
            </button>
            <div className="info-text">
              <p>Supported formats: JPG, PNG, WEBP</p>
              <p>Maximum file size: 10MB</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ImageUploader;