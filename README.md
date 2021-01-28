YAML multi-document as stream
=============================

This is parser/generator for YAML containing multiple documents as streams.


Installation
------------

    npm -i yaml-document-stream

[js-yaml](https://github.com/nodeca/js-yaml) is a peer dependency, make sure to add it also if not installed already.

Usage
-----

Convert YAML stream, to stream of parsed objects

```js
  // See example.read.js for full source

  fs.createReadStream('file.yaml').pipe(
    new YamlStreamReadTransformer()
  )
```

Convert stream of objects, to YAML multi-document

```js
  // See example.write.js for full source

  stream.Readable.from([{d:1}, {d:2}], {
    objectMode: true,
  }).pipe(
    new YamlStreamWriteTransformer()
  ).pipe(
    process.stdout
  )
```

Note
----

This is not a full streaming parser for YAML, only splitting documents is done in streaming fashion, the single document parsing is done via `js-yaml`
