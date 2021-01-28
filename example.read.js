const fs = require('fs');
const {YamlStreamReadTransformer} = require('.');


fs.createReadStream('src/fixtures/simple.yaml').pipe(
  new YamlStreamReadTransformer()
).on('data', (doc) => {
  console.log('Got document:', doc)
})