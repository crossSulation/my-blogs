import React, { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="App">
      <h1>Image Gallery</h1>
      <ImageUpload onUploadSuccess={handleUploadSuccess} />
      <ImageGallery key={refresh} />
    </div>
  );
}

export default App;
