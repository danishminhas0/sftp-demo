import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SftpClient from 'ssh2-sftp-client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

@Injectable()
export class SftpService {
  private client: SftpClient;

  constructor(private configService: ConfigService) {
    this.client = new SftpClient();
  }

  async uploadFileFromLocal(localFileName: string, remoteFolder: string): Promise<string> {
    const sftpConfig = {
      host: this.configService.get<string>('SFTP_HOST'),
      port: this.configService.get<number>('SFTP_PORT'),
      username: this.configService.get<string>('SFTP_USERNAME'),
      password: this.configService.get<string>('SFTP_PASSWORD'),
    };
    console.log(sftpConfig);

    const localFilePath = path.join(__dirname, '..', '..', 'src/local_files', localFileName);

    if (!fs.existsSync(localFilePath)) {
      throw new Error(`Local file not found: ${localFilePath}`);
    }

    try {
      await this.client.connect(sftpConfig);
      const remoteFilePath = `${remoteFolder}/${localFileName}`;
      await this.client.put(localFilePath, remoteFilePath);
      await this.client.end();
      return `File uploaded to ${remoteFilePath}`;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async generateAndUploadMappedCsv(): Promise<string> {
    const inputFilePath = path.join(__dirname, '..', '..', 'src/local_files', 'products.csv');
    const outputFilePath = path.join(__dirname, '..', '..', 'src/local_files', 'mapped_products.csv');

    const productTotals: { [key: string]: number } = {};

    // Read the CSV file and aggregate amounts sold in 2024
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(inputFilePath)
        .pipe(csv())
        .on('data', (row) => {
          const date = new Date(row.date);
          const year = date.getFullYear();

          if (year === 2024) {
            const productName = row.product_name;
            const amountProduced = parseInt(row.amount_produced, 10);

            // Aggregate amount produced for each product
            if (!productTotals[productName]) {
              productTotals[productName] = 0;
            }
            productTotals[productName] += amountProduced;
          }
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // Prepare data for the new CSV
    const records = Object.entries(productTotals).map(([productName, amountSold]) => ({
      product_name: productName,
      amount_sold_in_2024: amountSold,
    }));

    // Write to the new CSV file
    const csvWriter = createObjectCsvWriter({
      path: outputFilePath,
      header: [
        { id: 'product_name', title: 'product' },
        { id: 'amount_sold_in_2024', title: 'sales_2024' },
      ],
    });

    await csvWriter.writeRecords(records);

    // Upload the new CSV file to the SFTP server
    await this.uploadFileFromLocal('mapped_products.csv', '/test'); // Ensure the correct remote folder

    return 'Mapped CSV uploaded successfully!';
  }
}
