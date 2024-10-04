import { Controller, Get, Query } from '@nestjs/common';
import { SftpService } from './sftp.service';

@Controller('sftp')
export class SftpController {
  constructor(private readonly sftpService: SftpService) {}

  @Get('test')
  getHello(): string {
    return 'Hello World';
  }

  // GET route that uploads a local file to the SFTP server
  @Get('upload')
  async uploadFile(
    @Query('file') fileName: string,  // Local file name to upload
    @Query('folder') folder: string   // Remote folder where the file should be uploaded
  ): Promise<string> {
    if (!fileName || !folder) {
      return 'File name and remote folder are required';
    }

    try {
      const result = await this.sftpService.uploadFileFromLocal(fileName, folder);
      return result;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  // GET route to generate the mapped CSV and upload it to the SFTP server
  @Get('generate-upload')
  async generateAndUploadCsv(): Promise<string> {
    try {
      const result = await this.sftpService.generateAndUploadMappedCsv();
      return result;
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
}
