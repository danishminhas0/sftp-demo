// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { SftpModule } from './sftp/sftp.module';

// @Module({
//   imports: [SftpModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}


// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SftpModule } from './sftp/sftp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,  // Makes the ConfigModule available across all modules without needing to import it multiple times
    }),
    SftpModule,
  ],
})
export class AppModule {}
