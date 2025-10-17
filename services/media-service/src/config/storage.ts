import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

export type StorageProvider = 'local' | 's3' | 'r2';

interface StorageConfig {
  provider: StorageProvider;
  bucket?: string;
  region?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  cdnUrl?: string;
  localPath?: string;
}

class StorageService {
  private config: StorageConfig;
  private s3Client?: S3Client;

  constructor() {
    this.config = {
      provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'local',
      bucket: process.env.S3_BUCKET || process.env.R2_BUCKET,
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT || process.env.R2_ENDPOINT,
      accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
      cdnUrl: process.env.CDN_URL || process.env.R2_PUBLIC_URL,
      localPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads')
    };

    if (this.config.provider === 's3' || this.config.provider === 'r2') {
      this.initializeS3Client();
    }
  }

  private initializeS3Client() {
    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      throw new Error('S3/R2 credentials not configured');
    }

    const clientConfig: any = {
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey
      }
    };

    // For Cloudflare R2 or custom S3 endpoint
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
    }

    this.s3Client = new S3Client(clientConfig);
  }

  /**
   * Upload a file to the configured storage provider
   */
  async uploadFile(
    filePath: string,
    key: string,
    mimetype: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    if (this.config.provider === 'local') {
      return this.uploadToLocal(filePath, key);
    } else {
      return this.uploadToS3(filePath, key, mimetype, metadata);
    }
  }

  /**
   * Upload buffer to storage
   */
  async uploadBuffer(
    buffer: Buffer,
    key: string,
    mimetype: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    if (this.config.provider === 'local') {
      return this.uploadBufferToLocal(buffer, key);
    } else {
      return this.uploadBufferToS3(buffer, key, mimetype, metadata);
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.config.provider === 'local') {
      return this.deleteFromLocal(key);
    } else {
      return this.deleteFromS3(key);
    }
  }

  /**
   * Get a signed URL for temporary access to a private file
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.config.provider === 'local') {
      // For local storage, return direct URL
      return this.getLocalUrl(key);
    } else {
      return this.getS3SignedUrl(key, expiresIn);
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.config.provider === 'local') {
      return this.getLocalUrl(key);
    } else if (this.config.cdnUrl) {
      // Use CDN URL if configured (e.g., Cloudflare CDN)
      return `${this.config.cdnUrl}/${key}`;
    } else if (this.config.endpoint) {
      // Use custom endpoint
      return `${this.config.endpoint}/${this.config.bucket}/${key}`;
    } else {
      // Use standard S3 URL
      return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(key: string): Promise<boolean> {
    if (this.config.provider === 'local') {
      const filePath = path.join(this.config.localPath!, key);
      return fs.existsSync(filePath);
    } else {
      try {
        const command = new HeadObjectCommand({
          Bucket: this.config.bucket!,
          Key: key
        });
        await this.s3Client!.send(command);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Get file stream
   */
  async getFileStream(key: string): Promise<Readable> {
    if (this.config.provider === 'local') {
      const filePath = path.join(this.config.localPath!, key);
      return fs.createReadStream(filePath);
    } else {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket!,
        Key: key
      });
      const response = await this.s3Client!.send(command);
      return response.Body as Readable;
    }
  }

  // Private methods for local storage
  private async uploadToLocal(filePath: string, key: string): Promise<{ url: string; key: string }> {
    const destPath = path.join(this.config.localPath!, key);
    const destDir = path.dirname(destPath);

    // Ensure directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy file
    fs.copyFileSync(filePath, destPath);

    return {
      url: this.getLocalUrl(key),
      key
    };
  }

  private async uploadBufferToLocal(buffer: Buffer, key: string): Promise<{ url: string; key: string }> {
    const destPath = path.join(this.config.localPath!, key);
    const destDir = path.dirname(destPath);

    // Ensure directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Write buffer to file
    fs.writeFileSync(destPath, buffer);

    return {
      url: this.getLocalUrl(key),
      key
    };
  }

  private async deleteFromLocal(key: string): Promise<void> {
    const filePath = path.join(this.config.localPath!, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private getLocalUrl(key: string): string {
    const baseUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3003';
    return `${baseUrl}/uploads/${key}`;
  }

  // Private methods for S3/R2 storage
  private async uploadToS3(
    filePath: string,
    key: string,
    mimetype: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    const fileContent = fs.readFileSync(filePath);
    return this.uploadBufferToS3(fileContent, key, mimetype, metadata);
  }

  private async uploadBufferToS3(
    buffer: Buffer,
    key: string,
    mimetype: string,
    metadata?: Record<string, string>
  ): Promise<{ url: string; key: string }> {
    const command = new PutObjectCommand({
      Bucket: this.config.bucket!,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      Metadata: metadata
    });

    await this.s3Client!.send(command);

    return {
      url: this.getPublicUrl(key),
      key
    };
  }

  private async deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.bucket!,
      Key: key
    });

    await this.s3Client!.send(command);
  }

  private async getS3SignedUrl(key: string, expiresIn: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.config.bucket!,
      Key: key
    });

    return await getSignedUrl(this.s3Client!, command, { expiresIn });
  }

  /**
   * Get storage provider name
   */
  getProvider(): StorageProvider {
    return this.config.provider;
  }

  /**
   * Get storage configuration (without secrets)
   */
  getConfig(): Partial<StorageConfig> {
    return {
      provider: this.config.provider,
      bucket: this.config.bucket,
      region: this.config.region,
      cdnUrl: this.config.cdnUrl
    };
  }
}

// Singleton instance
let storageService: StorageService;

export const getStorageService = (): StorageService => {
  if (!storageService) {
    storageService = new StorageService();
  }
  return storageService;
};

export default StorageService;
