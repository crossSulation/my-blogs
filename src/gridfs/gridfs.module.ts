import { Module } from '@nestjs/common';
import { GridFsService } from './gridfs.service';
import { GridFsController } from './gridfs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { GridFsModel } from './gridfs.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'fs.files', schema: GridFsModel }])
  ],
  controllers: [GridFsController],
  providers: [GridFsService],
  exports: [GridFsService]
})
export class GridFsModule {}