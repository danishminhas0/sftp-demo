import { Test, TestingModule } from '@nestjs/testing';
import { SftpController } from './sftp.controller';

describe('SftpController', () => {
  let controller: SftpController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SftpController],
    }).compile();

    controller = module.get<SftpController>(SftpController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
