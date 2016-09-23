# File Info

Quick and easy file info detection in Javascript. Accepts binary/base64/strings. 

```js
/// Get information a file; mime, type, extension:
FileInfo(yourInputVar).then(function(fileInfo) { // accepts: URL | Base64 | Blob | Buffer
	// example: {mp3: {mime: 'audio/mpeg', type: 'audio'}}
}, function(err) {
	
});

/// Detect whether an input is of a specific type:
FileInfo.is(yourInputVar, yourTargetType).then(function(truthy) {
  
}, function(err) {

};
```

#### Detects the following file formats

```
{
	/* text */
	json: {mime: 'application/json', type: 'text'},
	txt: {mime: 'text/plain', type: 'text'},

	/* image */
	bmp: {mime: 'image/bmp', type: 'image'},
	gif: {mime: 'image/gif', type: 'image'},
	icns: {mime: 'image/icns', type: 'image'},
	ico: {mime: 'image/x-icon', type: 'image'},
	jpeg: {mime: 'image/jpg', type: 'image'},
	jpg: {mime: 'image/jpg', type: 'image'},
	png: {mime: 'image/png', type: 'image'},
	tiff: {mime: 'image/tiff', type: 'image'},
	webp: {mime: 'image/webp', type: 'image'},

	/* audio */
	aiff: {mime: 'audio/aiff', type: 'audio'},
	mid: {mime: 'audio/mid', type: 'audio'},
	mp3: {mime: 'audio/mpeg', type: 'audio'},
	ogg: {mime: 'audio/ogg', type: 'audio'},
	wav: {mime: 'audio/wav', type: 'audio'},

	/* video */
	mp4: {mime: 'video/mp4', type: 'video'},
	mpeg: {mime: 'video/mpeg', type: 'video'},
	webm: {mime: 'video/webm', type: 'video'},

	/* clipart */
	svg: {mime: 'image/svg+xml', type: 'clipart'},

	/* font */
	eot: {mime: 'application/vnd.ms-fontobject', type: 'font'}, // http://en.wikipedia.org/wiki/Embedded_OpenType
	otf: {mime: 'application/font-sfnt', type: 'font'},
	ttf: {mime: 'application/font-sfnt', type: 'font'},
	woff: {mime: 'application/font-woff', type: 'font'},
	woff2: {mime: 'application/font-woff', type: 'font'},

	/* package */
	pdf: {mime: 'application/pdf', type: 'package'},
	ps: {mime: 'application/postscript', type: 'package'},
	psd: {mime: 'image/vnd.adobe.photoshop', type: 'package'},
	rtf: {mime: 'application/rtf', type: 'package'},
	zip: {mime: 'application/zip', type: 'package'}
}
```
--------------------------------------------------------------------------------------------------------------

The MIT License

Copyright (c) 2015 Michael Deal <https://mudcu.be>. All rights reserved.
