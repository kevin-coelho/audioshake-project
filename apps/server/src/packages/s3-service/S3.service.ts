import { Service } from 'typedi';
import { ServerConfig } from '../config';
import { S3 } from 'aws-sdk';
import { Stream } from 'stream';

/**
 * Class to encapsulate the S3 SDK.
 */
@Service()
export class S3Service {
  constructor(private readonly serverConfig: ServerConfig) {}

  getUpstreamHandle(Key: string, stream: Stream) {
    return new S3({
      apiVersion: 'latest',
      params: { Bucket: this.serverConfig.s3.bucket, Key, Body: stream },
      accessKeyId: this.serverConfig.s3.accessKey,
      secretAccessKey: this.serverConfig.s3.secretAccessKey,
    });
  }
}
