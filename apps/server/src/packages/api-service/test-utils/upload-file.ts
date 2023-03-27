import { AxiosInstance } from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import concat from 'concat-stream';

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
