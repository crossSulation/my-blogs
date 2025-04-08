import React, { useEffect, useState, useCallback } from 'react';
import { getImageList, getImageMetadataByDimension } from '../api';
import CanvasEditor from './CanvasEditor';
import './ImageGallery.css'; // 新增样式文件

const ImageGallery = () => {
  const [previewImage, setPreviewImage] = useState(null);
  const [canvasImage, setCanvasImage] = useState(null); // 新增状态用于存储预览图片的 URL
  const handleDownload = (filename) => {
    window.open(`http://localhost:9099/gridfs/download/${filename}`);
  };
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [groupedImages, setGroupedImages] = useState({
    uploadTime: [],
    size: [],
  });

  const fetchImages = useCallback(async () => {
    try {
      const response = await getImageList();
      const images = response.map((image) => ({
        ...image,
        uploadDate: new Date(image.uploadDate).toLocaleString(),
        size: (image.length / 1024).toFixed(2) + ' KB',
      }));
      setImages(images);
      const metadata = await getImageMetadataByDimension(filter);
      setGroupedImages(metadata);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    }
  }, [filter]);

  useEffect(() => {
    fetchImages();
  }, [filter]);

  const onFilerChange = useCallback(async (e) => {
    setFilter(e.target.value);
    const metadata = await getImageMetadataByDimension(e.target.value);
    const currentGroup = {[e.target.value]: metadata.values()};
    setGroupedImages(Object.assign({}, groupedImages, currentGroup));
  }, [groupedImages]);
  return (
    <div className="image-gallery">
      <h2>图片库</h2>
      <div className="filter-container">
        <select value={filter} onChange={onFilerChange}>
          <option value="all">全部</option>
          <option value="uploadTime">按上传时间分组</option>
          <option value="size">按大小分组</option>
          {Object.keys(groupedImages).map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>
      <div className="gallery-container">
        {(filter === 'all'
          ? images
          : groupedImages[filter]?.map((filename) =>
              images.find((img) => img.filename === filename),
            )
        ).map((image, index) => (
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
              <button onClick={() => handleDownload(image.filename)}>
                下载
              </button>
              <button
                onClick={() =>
                  setPreviewImage(
                    `http://localhost:9099/gridfs/download/${image.filename}`,
                  )
                }
              >
                预览
              </button>
              <button
                onClick={() =>
                  setCanvasImage(
                    `http://localhost:9099/gridfs/download/${image.filename}`,
                  )
                }
              >
                编辑
              </button>
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
        {canvasImage && (
          <CanvasEditor
            imageUrl={canvasImage}
            onClose={() => setCanvasImage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
