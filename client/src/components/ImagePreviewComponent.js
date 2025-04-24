import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; // Import icons
import './ImagePreviewComponent.css'; // Import the CSS file

const ImagePreviewComponent = ({ currentImage, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fetchedSimilarImages, setFetchedSimilarImages] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState(currentImage); // State to store the current image URL

  useEffect(() => {
    const fetchSimilarImages = async () => {
      try {
        const formData = new FormData();
        const file = await convertImageToFile(currentImage);
        formData.append('file', file);
        const response = await axios.post('http://localhost:5000/predict', formData);
        setFetchedSimilarImages(response.data.similar_images);
      } catch (error) {
        console.error('Failed to fetch similar images:', error);
      }
    };

    fetchSimilarImages();
  }, [currentImage]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      
    }
  };

  const handleNext = () => {
    if (currentIndex < fetchedSimilarImages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const onCurrentImageClick = (index) => {
    setCurrentIndex(index)
    setCurrentImageUrl(`http://localhost:9099/gridfs/thumbnail/${fetchedSimilarImages[index]}`)
  };
  const convertImageToFile = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileName = imageUrl.split('/').pop();
      const type = fileName.split('.').pop();
      return new File([blob], fileName, { type: `image/${type}` });
    } catch (error) {
      console.error('Failed to convert image to file:', error);
      return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        <img src={currentImageUrl} alt="Current Image" className="current-image" />
        <div className="navigation">
          <span
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`nav-arrow ${currentIndex === 0 ? 'disabled' : ''}`}
          >
            <FaArrowLeft /> {/* Left arrow icon */}
          </span>
          <div className="similar-images">
            {fetchedSimilarImages.map((image, index) => (
              <img
                key={index}
                src={`http://localhost:9099/gridfs/thumbnail/${image}`}
                alt={`Similar ${index + 1}`}
                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                onClick={() => onCurrentImageClick(index)}
              />
            ))}
          </div>
          <span
            onClick={handleNext}
            disabled={currentIndex === fetchedSimilarImages.length - 1}
            className={`nav-arrow ${currentIndex === fetchedSimilarImages.length - 1 ? 'disabled' : ''}`}
          >
            <FaArrowRight /> {/* Right arrow icon */}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewComponent;