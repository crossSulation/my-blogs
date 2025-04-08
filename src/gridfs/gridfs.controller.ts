import { Controller, Post, Get, Param, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GridFsService } from './gridfs.service';
import { Response } from 'express';

@Controller('gridfs')
export class GridFsController {
  constructor(private readonly gridFsService: GridFsService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const uploadResults = await Promise.all(
      files.map(file => {
        return this.gridFsService.uploadFile(file.buffer, decodeURIComponent(file.originalname));
      })
    );
    return { success: true, files: uploadResults };
  }

  @Get('download/:filename')
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
        const downloadStream = await this.gridFsService.downloadFile(filename);
        // Encode the filename to avoid invalid characters
        const encodedFilename = encodeURIComponent(filename);
        res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Failed to download file:', error);
        res.status(500).send('Internal Server Error');
    }
  }
  
  @Get('thumbnail/:filename')
  async getThumbnail(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const thumbnail = await this.gridFsService.getThumbnail(filename);
      res.setHeader('Content-Type', 'image/jpeg'); // 根据实际情况调整 Content-Type
      res.send(thumbnail);
    } catch (error) {
      console.error('Failed to get thumbnail:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  @Get('list')
  async listFiles() {
    const files = await this.gridFsService.listFiles();
    return files;
  }

  @Get('metadata/:filename')
  async getImageMetadata(@Param('filename') filename: string) {
    return await this.gridFsService.getImageMetadata(filename);
  }

  @Get('metadata-by-dimension/:dimension')
  async getImageMetadataByDimension(@Param('dimension') dimension: string) {
    return await this.gridFsService.getImageMetadataByDimension(dimension);
  }
}