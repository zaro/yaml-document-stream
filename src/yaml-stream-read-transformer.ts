import { Transform, TransformCallback } from "stream";
import * as yaml from "js-yaml";

const LF = 0x0A; //'\n'.charCodeAt(0);
const CR = 0x0D; //'\r'.charCodeAt(0);

function skipUntilEOL(chunk:Buffer, startPos: number): number {
  while(startPos < chunk.length && chunk[startPos] !== LF && chunk[startPos] !== CR) {
    startPos++;
  }
  while(startPos < chunk.length && (chunk[startPos] === LF || chunk[startPos] === CR)) {
    startPos++;
  }
  return startPos;
}

function isBeginningOfLine(chunk:Buffer, startPos: number): boolean {
  return startPos === 0 || (
    startPos > 0 &&
    (chunk[startPos-1] === LF || chunk[startPos-1] === CR)
  );
}

function getNextRecordStart(buf:Buffer, startIndex: number): [number, number] {
  while(true){
    startIndex = buf.indexOf('---', startIndex);
    if(startIndex<0) {
      break;
    }
    if(isBeginningOfLine(buf, startIndex)) {
      const dataStart = skipUntilEOL(buf, startIndex +3)
      return [startIndex ,dataStart];
    }
    startIndex++;
  }
  return [-1,-1];
}

export class YamlStreamReadTransformer extends Transform{
  protected currentRecord: Buffer = null;
  constructor(){
    super({
      readableObjectMode: true
    })
  }
  protected append(chunk: Buffer) {
    if(!this.currentRecord) {
      this.currentRecord= chunk;
    } else {
      this.currentRecord = Buffer.concat([this.currentRecord, chunk]);
    }
  }

  protected emitRecord(start:number, end: number) {
    if(!this.currentRecord){
      return;
    }
    if(end<0){
      end = this.currentRecord.length;
    }
    const buf = this.currentRecord.slice(start,end);
    const docString = buf.toString();
    const doc = yaml.load(docString);
    if(doc !== null && doc !== undefined) {
      this.push(doc);
    }
    this.currentRecord = this.currentRecord.slice(end);
  }

  protected tryEmit(final: boolean = false) {
    let currentRecordStart, currentRecordDataStart;
    do {
      const [nextRecordStart, nextRecordDataStart] = getNextRecordStart(this.currentRecord, currentRecordDataStart ?? 0);
      if(currentRecordStart >= 0 && (nextRecordStart >=0 || final)) {
        this.emitRecord(currentRecordDataStart, nextRecordStart)
      }
      currentRecordStart = nextRecordStart;
      currentRecordDataStart = nextRecordDataStart;
    } while(currentRecordStart >= 0);
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback): void {
    this.append(chunk)
    let error;
    try {
      this.tryEmit();
    }catch(e) {
      error = e;
    }
    callback(error);
  }

  _flush(callback: TransformCallback): void {
    let error;
    try {
      this.tryEmit(true);
    }catch(e) {
      error = e;
    }
    callback(error);
  }
}