import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private configured = false;

  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get<string>('cloudinary.cloudName');
    const apiKey = this.configService.get<string>('cloudinary.apiKey');
    const apiSecret = this.configService.get<string>('cloudinary.apiSecret');

    if (cloudName && apiKey && apiSecret && cloudName !== 'your-cloud-name') {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });
      this.configured = true;
      this.logger.log('✅ Cloudinary configured');
    } else {
      this.logger.warn('⚠️ Cloudinary not configured - using base64');
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'devflow-ai/avatars'): Promise<string> {
    if (!this.configured) {
      const base64 = file.buffer.toString('base64');
      return 'data:' + file.mimetype + ';base64,' + base64;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            this.logger.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            this.logger.log('Uploaded to Cloudinary: ' + result?.secure_url);
            resolve(result?.secure_url || '');
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  }

  isConfigured(): boolean {
    return this.configured;
  }
}