
import * as fs from 'fs';
import { YamlStreamReadTransformer } from "./yaml-stream-read-transformer";
import * as streamBuffers from "stream-buffers";
import * as stream from 'stream';
import { streamToRx } from 'rxjs-stream';
import { toArray } from "rxjs/operators";

const collectStream = async readableStream => {
  const dataStream = await streamToRx(readableStream).pipe(
    toArray(),
  );
  return await dataStream.toPromise();
};

function getStreamForString(s:string): stream.Readable {
  var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
    frequency: 1,   // in milliseconds.
    chunkSize: Math.floor(Math.random() * (10) + 1) // in bytes.
  });
  myReadableStreamBuffer.put(s);
  myReadableStreamBuffer.stop();
  return myReadableStreamBuffer;
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


describe('YamlStreamReadTransformer', () => {

  beforeAll(async () => {


  });


  describe('trasnforms', () => {
    it('simple', async () => {
      const result = await collectStream(
        getStreamForString(getYaml('simple')).pipe(new YamlStreamReadTransformer())
      );

      expect(result).toMatchObject(getJson('simple'));
    });

    it('with preamble', async () => {
      const result = await collectStream(
        getStreamForString(getYaml('simple-with-preamble')).pipe(new YamlStreamReadTransformer())
      );

      expect(result).toMatchObject(getJson('simple'));
    });

  });
});
