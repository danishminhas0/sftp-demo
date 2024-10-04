// src/sftp/sftp.module.ts
import { Module } from '@nestjs/common';
import { SftpService } from './sftp.service';
import { SftpController } from './sftp.controller';

@Module({
  imports: [], // Add any other required modules here
  controllers: [SftpController],
  providers: [SftpService],
})
export class SftpModule {}
