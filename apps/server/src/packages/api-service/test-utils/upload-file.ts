import { AxiosInstance } from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import concat from 'concat-stream';

/**
 * Utility function intended for use with integration tests. Takes an apiInstance
 * (axios) and will stream a file from specified "path" to the API for upload.
 * Returns a promise that resolves when upload is complete or rejects with err.
 * @param path
 * @param apiInstance
 */
export async function uploadFile(path: string, apiInstance: AxiosInstance) {
  const filestream = fs.createReadStream(path);
  const fd = new FormData();
  fd.append('file', filestream);
  return new Promise<{
    msg: string;
    id: string;
    fileSize: number;
  }>((resolve, reject) => {
    filestream.on('error', (err) => reject(err));
    fd.pipe(
      concat((data) => {
        apiInstance
          .request({
            url: '/asset',
            method: 'POST',
            data,
            headers: fd.getHeaders(),
          })
          .then((res) => resolve(res.data))
          .catch((err) => reject(err));
      }),
    );
  });
}
