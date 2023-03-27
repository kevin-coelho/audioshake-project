import { Service } from 'typedi';
import { ServerConfig } from '../config';
import { S3 } from 'aws-sdk';
import { Stream } from 'stream';

@Service()
export class S3Service {
  constructor(private readonly serverConfig: ServerConfig) {}

  getUpstreamHandle(Key: string, stream: Stream) {
    return new S3({
      apiVersion: 'latest',
      params: { Bucket: this.serverConfig.s3.bucket, Key, Body: stream },
    });
  }
}
