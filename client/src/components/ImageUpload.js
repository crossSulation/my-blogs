import React, { useState } from 'react';
import axios from 'axios';
import './ImageUpload.css'; // 新增样式文件

const ImageUpload = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file, encodeURIComponent(file.name));
    });
    formData.append('_charset_', 'utf-8');

    try {
      await axios.post('http://localhost:9099/gridfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      });
      setUploading(false);
      setFiles([]);
      onUploadSuccess();
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="file-input-container">
        <label htmlFor="file-upload" className="custom-file-upload">
          <i className="fas fa-cloud-upload-alt"></i>
          {files.length > 0 
            ? `${files.length} 个文件已选择`
            : '选择文件'}
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/png, image/jpeg, image/gif, image/webp"
          onChange={(e) => setFiles([...e.target.files])}
        />
      </div>
      
      {files.length > 0 && (
        <div className="upload-controls">
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? '上传中...' : '开始上传'}
          </button>
          
          {uploading && (
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;