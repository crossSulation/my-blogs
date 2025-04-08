import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import './CanvasEditor.css';

const CanvasEditor = ({ imageUrl, onClose }) => {
  const [brushType, setBrushType] = useState('pencil');
  const [showBrushMenu, setShowBrushMenu] = useState(false);
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [selectionMode, setSelectionMode] = useState('rectangle');
  const canvasImgRef = useRef(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [brushSettings, setBrushSettings] = useState({
    pencil: { color: '#000000', thickness: 2, pressure: 0.5 },
    pen: { color: '#000000', thickness: 2, pressure: 0.5 },
    signature: { color: '#000000', thickness: 2, pressure: 0.5 },
    brush: { color: '#000000', thickness: 2, pressure: 0.5 },
  });

  const closeAllMenus = useCallback(() => {
    setShowBrushMenu(false);
    setShowSelectionMenu(false);
    setSettingsVisible(false);
  }, [showBrushMenu, showSelectionMenu, settingsVisible]);

  useLayoutEffect(() => {
    const canvasImg = canvasImgRef.current;
    const ctx = canvasImg.getContext('2d');
    const overlayCanvas = document.querySelector('.overlay-canvas');
    overlayCanvas.width = canvasImg.width;
    overlayCanvas.height = canvasImg.height;
    const overlayCtx = overlayCanvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvasImg.width = img.width;
      canvasImg.height = img.height;
      overlayCanvas.width = img.width;
      overlayCanvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const startDrawing = (e) => {
      if (e.button !== 0) return;
      if(isDrawing) {
        isDrawing = false;
        return;
      }
      const rect = overlayCanvas.getBoundingClientRect();
      isDrawing = true;
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      overlayCtx.beginPath();
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const rect = overlayCanvas.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      overlayCtx.moveTo(lastX, lastY);
      overlayCtx.lineTo(currentX, currentY);
      overlayCtx.strokeStyle = brushSettings[brushType].color;
      overlayCtx.lineWidth = brushSettings[brushType].thickness;
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
      overlayCtx.stroke();
      lastX = currentX;
      lastY = currentY;
    };

    overlayCanvas.addEventListener('mousedown', startDrawing);
    overlayCanvas.addEventListener('mousemove', draw);


    return () => {
      overlayCanvas.removeEventListener('mousedown', startDrawing);
      overlayCanvas.removeEventListener('mousemove', draw);
    };
  }, [imageUrl]);
  const handleSettingChange = (brushType, setting, value) => {
    setBrushSettings((prev) => ({
      ...prev,
      [brushType]: {
        ...prev[brushType],
        [setting]: value,
      },
    }));
  };

  return (
    <div className="canvas-modal">
      <div className="toolbar">
        <div className="tool-group">
          <div className="brush-menu-container">
            <button
              className="tool-button"
              onClick={() => {
                closeAllMenus();
                setShowBrushMenu(!showBrushMenu);
              }}
            >
              <i className="fas fa-paint-brush"></i>
            </button>
            {showBrushMenu && (
              <div className="brush-menu">
                <button
                  className="tool-button"
                  onClick={() => {
                    setBrushType('pencil');
                    setShowBrushMenu(false);
                  }}
                >
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button
                  className="tool-button"
                  onClick={() => {
                    setBrushType('pen');
                    setShowBrushMenu(false);
                  }}
                >
                  <i className="fas fa-pen"></i>
                </button>
                <button
                  className="tool-button"
                  onClick={() => {
                    setBrushType('signature');
                    setShowBrushMenu(false);
                  }}
                >
                  <i className="fas fa-signature"></i>
                </button>
                <button
                  className="tool-button"
                  onClick={() => {
                    setBrushType('brush');
                    setShowBrushMenu(false);
                  }}
                >
                  <i className="fas fa-paint-brush"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="tool-group">
          <button className="tool-button">
            <i className="fas fa-eraser"></i>
          </button>
        </div>
        <div className="tool-group">
          <div className="selection-menu-container">
            <button
              className="tool-button"
              onClick={() => {
                closeAllMenus();
                setShowSelectionMenu(!showSelectionMenu);
              }}
            >
              <i className="fas fa-vector-square"></i>
            </button>
            {showSelectionMenu && (
              <div className="selection-menu">
                <button
                  className="tool-button"
                  onClick={() => {
                    setSelectionMode('rectangle');
                    setShowSelectionMenu(false);
                  }}
                >
                  <i className="fas fa-vector-square"></i>
                </button>
                <button
                  className="tool-button"
                  onClick={() => {
                    setSelectionMode('freeform');
                    setShowSelectionMenu(false);
                  }}
                >
                  <i className="fas fa-hand-pointer"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="tool-group">
          <button
            className="tool-button"
            onClick={() => {
              closeAllMenus();
              setSettingsVisible(!settingsVisible);
            }}
          >
            <i className="fas fa-cog"></i>
          </button>
          {settingsVisible && (
            <div className="settings-menu">
              {['pencil', 'pen', 'signature', 'brush'].map((type) => (
                <div key={type} className="brush-settings">
                  <h3>{type.charAt(0).toUpperCase() + type.slice(1)} 设置</h3>
                  <div className="setting-item">
                    <label>颜色：</label>
                    <input
                      type="color"
                      value={brushSettings[type].color}
                      onChange={(e) =>
                        handleSettingChange(type, 'color', e.target.value)
                      }
                    />
                  </div>
                  <div className="setting-item">
                    <label>粗细：</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={brushSettings[type].thickness}
                      onChange={(e) =>
                        handleSettingChange(
                          type,
                          'thickness',
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </div>
                  <div className="setting-item">
                    <label>压力：</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={brushSettings[type].pressure}
                      onChange={(e) =>
                        handleSettingChange(
                          type,
                          'pressure',
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="canvas-content">
        <canvas ref={canvasImgRef}></canvas>
        <canvas className="overlay-canvas"></canvas>
      </div>
    </div>
  );
};

export default CanvasEditor;
