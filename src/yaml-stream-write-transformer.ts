import { Transform, TransformCallback } from "stream";
import * as yaml from "js-yaml";

export class YamlStreamWriteTransformer extends Transform{
  constructor(protected yamlOptions?: any){
    super({
      writableObjectMode: true,
    })
  }

  _transform(obj: any, encoding: string, callback: TransformCallback): void {
    let error;
    try {
      const s = yaml.dump(obj, this.yamlOptions);
      if(s) {
        this.push('---\n' + s);
      }
    }catch(e) {
      error = e;
    }
    callback(error);
  }

}