import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { GridFsModule } from './gridfs/gridfs.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/my-blogs'),
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    GridFsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
