import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GridFsModel } from './gridfs.model';
import { GridFSBucket } from 'mongodb';
import * as sharp from 'sharp';

@Injectable()
export class GridFsService {
  private bucket: GridFSBucket;

  constructor(
    @InjectModel('fs.files') private readonly gridFsModel: Model<typeof GridFsModel>
  ) {
    const db = this.gridFsModel.db.db;
    if (!db) {
      throw new Error('Database connection is not available');
    }
    this.bucket = new GridFSBucket(db);
  }

  async uploadFile(buffer: Buffer, filename: string): Promise<{ filename: string, success: boolean }> {
    const uploadStream = this.bucket.openUploadStream(filename);
    uploadStream.end(buffer);
    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => resolve({ filename, success: true }));
      uploadStream.on('error', (err) => {
        console.error('Upload failed:', err);
        resolve({ filename, success: false });
      });
    });
}

  async downloadFile(filename: string): Promise<NodeJS.ReadableStream> {
    return this.bucket.openDownloadStreamByName(filename);
}

  async listFiles() {
    const files = await this.gridFsModel.find().exec();
    return files.map(file => ({
        ...file.toObject(),
        // Assuming the filename is stored in the 'originalname' field
        // Assuming the filename is stored in the 'originalname' field, use it instead
        filename: decodeURIComponent(file.get('filename') as string), // Decode the filename if needed
    }));
}

  async getThumbnail(filename: string) {
    const downloadStream = this.bucket.openDownloadStreamByName(filename);
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      downloadStream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        try {
          const thumbnail = await sharp(buffer)
            .resize(200, 200) // 调整为 200x200 尺寸，可按需修改
            .toBuffer();
          resolve(thumbnail);
        } catch (error) {
          reject(error);
        }
      });

      downloadStream.on('error', reject);
    });
  }
}