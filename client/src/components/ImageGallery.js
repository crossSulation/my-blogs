import React, { useEffect, useState, useCallback } from 'react';
import { getImageList } from '../api';
import CanvasEditor from './CanvasEditor';
import './ImageGallery.css'; // 新增样式文件

const ImageGallery = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [canvasImage, setCanvasImage] = useState(null); // 新增状态用于存储预览图片的 URL
  const handleDownload = (filename) => {
    window.open(`http://localhost:9099/gridfs/download/${filename}`);
  };
  const [images, setImages] = useState([]);

  const fetchImages = useCallback(async () => {
    try {
      const response = await getImageList();
      setImages(response.map(image => ({
        ...image,
        uploadDate: new Date(image.uploadDate).toLocaleString(),
        size: (image.length / 1024).toFixed(2) + ' KB'
      })));
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  return (
    <div className="gallery-container">
      {images.map((image, index) => (
        <div key={index} className="gallery-card">
          <img 
            src={`http://localhost:9099/gridfs/thumbnail/${image.filename}`} 
            alt={image.filename}
            className="gallery-image"
          />
          <div className="image-info">
            <span className="image-name">{image.filename}</span>
            <div className="image-meta">
              <span>上传时间: {image.uploadDate}</span>
              <span>大小: {image.size}</span>
            </div>
          </div>
          <div className="image-actions">
            <button onClick={() => handleDownload(image.filename)}>下载</button>
            <button onClick={() => setPreviewImage(`http://localhost:9099/gridfs/download/${image.filename}`)}>预览</button>
            <button onClick={() => setCanvasImage(`http://localhost:9099/gridfs/download/${image.filename}`)}>编辑</button>
          </div>
        </div>
      ))}
      {previewImage && (
        <div className="preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="preview-content">
            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )}
      {canvasImage && <CanvasEditor imageUrl={canvasImage} onClose={() => setCanvasImage(null)} />}
    </div>
  );
};

export default ImageGallery;