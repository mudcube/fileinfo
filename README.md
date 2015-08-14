# File Info

Quick and easy file info detection in Javascript:

```js
/// Basic usage:
var info = FileInfo(someVariable); // accepts: URL | Base64 | Blob | Buffer

/// Exposed internals:
var info = FileInfo.fromBuffer(arrayBuffer);
var info = FileInfo.fromString(string);
var info = FileInfo.fromExtension(someExtension); // accepts file extension [ex. "gif" | "webm"]
var info = FileInfo.fromMime(someMimeType); // accepts mimetype [ex. "image/gif" | "video/webm"]
///
var truthy = FileInfo.isBlob(someVariable); // true if (Blob | File)
var truthy = FileInfo.isSVGString(someVariable); // true if (SVG String | SVG Base64)
```
--------------------------------------------------------------------------------------------------------------

The MIT License

Copyright (c) 2015 Michael Deal <https://mudcu.be>. All rights reserved.
