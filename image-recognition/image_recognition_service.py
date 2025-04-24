import torch
import torchvision.models as models
from torchvision.models.feature_extraction import create_feature_extractor
import numpy as np
import os
from torchvision import transforms
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from gridfs import GridFS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# 连接 MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['my-blogs']
gfs = GridFS(db)

# 加载预训练的ResNet模型
model = models.resnet18(pretrained=True)
model.eval()

# 定义图像预处理步骤
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def download_all_images_from_mongodb():
    image_dir = os.path.join(os.path.dirname(__file__), 'image_database')
    os.makedirs(image_dir, exist_ok=True)
    gfsfiles = gfs.find()
    for gridout in gfsfiles:
        endfix = gridout.filename.split('.')[-1]
        if endfix not in ['png', 'jpg', 'jpeg']:
            continue  # 跳过非图片文件
        image_path = os.path.join(image_dir, gridout.filename)
        with open(image_path, 'wb') as f:
            f.write(gridout.read())

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    try:
        # Open and preprocess the image
        image = Image.open(file.stream).convert('RGB')  # Ensure RGB mode
        image = preprocess(image).unsqueeze(0)  # Add batch dimension
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 400
    try:
        # 从 MongoDB 下载图片到本地
        image_dir = os.path.join(os.path.dirname(__file__), 'image_database')
        with torch.no_grad():
            output = model(image)
        # 提取特征
        feature_extractor = create_feature_extractor(model, return_nodes={'avgpool': 'features'})
        features = feature_extractor(image)['features'].squeeze()
        features = features.detach().cpu().numpy()  # Detach before converting to NumPy

        # 假设已有特征库，这里简单示例
        feature_db = []
        image_paths = []
        image_names = []
        # 修改特征库路径
        for root, dirs, files in os.walk(image_dir):
            for file in files:
                if file.endswith(('.png', '.jpg', '.jpeg')):
                    image_path = os.path.join(root, file)
                    img = Image.open(image_path).convert('RGB')  # Ensure RGB mode
                    img = preprocess(img).unsqueeze(0) # Add batch dimension
                    with torch.no_grad():
                        img_features = feature_extractor(img)['features'].squeeze()
                        img_features = img_features.detach().cpu().numpy()  # Detach before converting to NumPy
                    # 检查特征维度是否匹配
                    if img_features.shape != features.shape:
                        continue  # 跳过特征维度不匹配的图像
                    feature_db.append(img_features)
                    image_paths.append(image_path)
                    image_names.append(file)

        # 计算相似度
        similarities = []
        for db_feature in feature_db:
            similarity = np.dot(features, db_feature) / (np.linalg.norm(features) * np.linalg.norm(db_feature))
            similarities.append(similarity)

        # 获取最相似的图片索引
        top_indices = np.argsort(similarities)[-5:][::-1]
        similar_images = [image_names[i] for i in top_indices]

        return jsonify({'similar_images': similar_images})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    download_all_images_from_mongodb()
    app.run(debug=True)