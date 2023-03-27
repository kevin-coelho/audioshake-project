// deps
import { Container } from 'typedi';
import { Router } from 'express';
import Busboy from 'busboy';
import { Stream } from 'stream';

// local deps
import { S3Service } from '../../s3-service/S3.service';
import { PostgresService } from '../../postgres-service';
import { AssetModel } from '../../postgres-service/models/Asset.model';
import { isDevOrTestEnvironment } from '../../util-fns/env.util';

export function getAssetRouter() {
  return Router({
    mergeParams: true,
  })
    // POST /asset (upload file)
    .post('/', async (req, res, next) => {
    const postgresService = Container.get(PostgresService);
    const s3Service = Container.get(S3Service);
    try {
      let asset: AssetModel | undefined = undefined;
      const busboy = Busboy({ headers: req.headers });
      const uploadPromise = new Promise<{
        msg: string;
        id: string;
        fileSize: number;
      }>((resolve, reject) => {
        let fileSize = 0;
        busboy.on('error', (err: Error) => {
          reject(err);
        });
        busboy.on(
          'file',
          (
            fieldname: string,
            fileStream: Stream,
            fileParams: {
              filename: string;
              encoding: string;
              mimeType: string;
            },
          ) => {
            const { filename, mimeType } = fileParams;
            try {
              asset = postgresService
                .getModels()
                .Asset.fromUploadedAsset(mimeType, filename);
              const s3 = s3Service.getUpstreamHandle(asset.key, fileStream);
              s3.upload({
                Body: fileStream,
                Bucket: asset.bucket,
                Key: asset.key,
                ContentType: mimeType,
              })
                .on('httpUploadProgress', (event) => {
                  fileSize = event.total;
                  // console.log(`Upload ${event.loaded}/${event.total}`);
                })
                .send((err: Error) => {
                  if (err) {
                    const result: {
                      name: string;
                      msg: string;
                      stack: string | undefined;
                    } = {
                      name: err.name,
                      msg: err.message,
                      stack: undefined,
                    };
                    if (isDevOrTestEnvironment()) {
                      result.stack = err.stack;
                    }
                    return reject(result);
                  }
                  return resolve({
                    msg: 'OK',
                    id: (asset as AssetModel).id,
                    fileSize,
                  });
                });
            } catch (err) {
              // request will get rejected with bad mime type or other errors
              return reject(err);
            }
          },
        );
      });
      req.pipe(busboy);
      const result = await uploadPromise;
      if (!asset) {
        return res.status(500).json({
          msg: 'Error, db asset was not created for file',
        });
      }
      const assetModel = asset as AssetModel;
      assetModel.fileSize = result.fileSize;
      await postgresService.getModels().Asset.query().insert(assetModel);
      return res.status(200).json(result);
    } catch (err) {
      return next(err);
    }
  });
}
