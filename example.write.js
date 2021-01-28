const fs = require('fs');
const stream = require('stream');
const {YamlStreamWriteTransformer} = require('./dist');


stream.Readable.from([{d:'1'}, {d:'2'}], {
  objectMode: true,
}).pipe(
  new YamlStreamWriteTransformer({
    // pass any js-yaml dump options
    forceQuotes: true
  })
).pipe(
  process.stdout
)