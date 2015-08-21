# File Info

Quick and easy file info detection in Javascript:

```js
/// Get information a file; mime, type, extension:
FileInfo(yourInputVar, function(fileInfo) { // accepts: URL | Base64 | Blob | Buffer

}, function(err) {

});

/// Detect whether an input is of a specific type:
FileInfo.is({
  input: yourInputVar,
  type: yourTargetType
}, function(truthy) {
  
}, function(err) {

};

/// Exposed internals:
var info = FileInfo.fromBuffer(yourArrayBuffer);
var info = FileInfo.fromString(yourString);
var info = FileInfo.fromExtension(yourExtension); // accepts file extension [ex. "gif" | "webm"]
var info = FileInfo.fromMime(yourMimeType); // accepts mimetype [ex. "image/gif" | "video/webm"]
///
var truthy = FileInfo.isBlob(yourVar); // true if (Blob | File)
var truthy = FileInfo.isSVGString(yourVar); // true if (SVG String | SVG Base64)
```
--------------------------------------------------------------------------------------------------------------

The MIT License

Copyright (c) 2015 Michael Deal <https://mudcu.be>. All rights reserved.
