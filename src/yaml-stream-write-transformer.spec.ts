
import * as fs from 'fs';
import { YamlStreamWriteTransformer } from "./yaml-stream-write-transformer";
import * as stream from 'stream';
import { streamToRx } from 'rxjs-stream';
import { reduce, toArray } from "rxjs/operators";

const collectStream = async readableStream => {
  const dataStream = await streamToRx(readableStream).pipe(
    reduce((r, v) => r+v, ''),
  );
  return await dataStream.toPromise();
};

function getStreamForArray(data:any[]): stream.Readable {
  return stream.Readable.from(data, {
    objectMode: true,
  });
}

function getJson(name) {
  return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/${name}.json`, {
    encoding: 'utf8'
  }));
}

function getYaml(name) {
  return fs.readFileSync(`${__dirname}/fixtures/${name}.yaml`, {
    encoding: 'utf8'
  });
}


describe('YamlStreamWriteTransformer', () => {

  describe('serialize', () => {
    it('simple', async () => {
      const result = await collectStream(
        getStreamForArray(getJson('simple')).pipe(new YamlStreamWriteTransformer())
      );

      expect(result).toBe(getYaml('simple'));
    });


  });
});
