/*
	----------------------------------------------------------
	FileInfo : 0.1.2 : 2016-02-02 : https://mudcu.be
	----------------------------------------------------------
	references
	----------------------------------------------------------
		http://en.wikipedia.org/wiki/List_of_file_bySignature
		http://www.filebySignature.net/
	----------------------------------------------------------
*/

var FileInfo = (function () {

	var DEBUG = false;

	var byExtension = (function () {
		var res = {
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
		};
		for (var ext in res) {
			res[ext].extension = ext;
		}
		return res;
	})();

	var byMime = (function () {
		var res = {};
		for (var ext in byExtension) {
			var item = byExtension[ext];
			res[item.mime] = item;
		}
		return res;
	})();

	var bySignature = {
		/* image */
		'424d'    : 'bmp',
		'47494638': 'gif',
			// 47 49 46 38 37 61 (GIF87a)
			// 47 49 46 38 39 61 (GIF89a)
		'69636e73': 'icns', // http://en.wikipedia.org/wiki/Apple_Icon_Image_format
		'00000100': 'ico',
		'ffd8ff'  : 'jpg',
		'89504e47': 'png',
			// 89 50 4E 47 0D 0A 1A 0A
		'4d4d002a': 'tiff', // big endian format
		'49492a00': 'tiff', // little endian format
		'57454250': 'webp',

		/* audio */
		'464f524d': 'aiff',
			// 46 4F 52 4D nn nn nn nn 41 49 46 46
		'4d546864': 'mid', // 'MThd'
		'fffb'    : 'mp3',
		'494433'  : 'mp3',
		'4f676753': 'ogg',
		'52494646': 'wav',
			// 52 49 46 46 nn nn nn nn 57 41 56 45

		/* video */
		'000001b3': 'mpeg', // elementary stream (ES) // http://en.wikipedia.org/wiki/Elementary_stream
		'000001ba': 'mpeg', // program stream (PS) // http://en.wikipedia.org/wiki/MPEG_program_stream
		'1a45dfa3': 'webm',

		/* font */
		'4c50'    : 'eot',
		'00010000': 'ttf', // windows
			// 00 01 00 00 00
		'74727565': 'ttf', // mac
		'4f54544f': 'otf',
			// 4F 54 54 4F 00
		'774f4646': 'woff',
			// 77 4F 46 46 00 01 00 00
		'774f4646': 'woff',
		'774f4632': 'woff2',
			// 77 4F 46 32 00 01 00 00

		/* package */
		'25504446': 'pdf', // '%PDF'
		'25215053': 'ps',  // '%!PS-Ado'
		'38425053': 'psd', // '8BPS'
		'7b5c7274': 'rtf', // '{\rtf1'
			// 7b 5c 72 74 66 31
		'504b0304': 'zip', // 'PK..' - archive
		'504b0506': 'zip', // 'PK..' - empty archive
		'504b0708': 'zip', // 'PK..' - spanned archive

		/* loose detection - keep at end of object */
		'7b'      : 'json' // '{'
	};

	function FileInfo(input, onsuccess, onerror) {
		return wrap(function (onsuccess, onerror) {
			if (typeof input === 'string') {
				var res = fromString(input);
				if (res) {
					onsuccess(res);
				} else {
					onsuccess(byExtension.png); //- fix me
					warn(input, 1);
				}
			} else {
				if (isBlob(input)) {
					fromBlob(input, onsuccess, handleError);
				} else {
					handleError();
					warn(input, 2);
				}
			}
		}, arguments);

		function handleError() {
			onerror && onerror({
				message: 'blobFromBuffer: format could not be determined'
			});
		};
	}

	FileInfo.fromBlob = fromBlob;
	FileInfo.fromBuffer = fromBuffer;
	FileInfo.fromString = fromString;
	FileInfo.fromExtension = fromExtension;
	FileInfo.fromMime = fromMime;

	FileInfo.is = function (input, targetType, onsuccess, onerror) {
		return wrap(function (onsuccess, onerror) {
			FileInfo(input, function (fileInfo) {
				for (var key in fileInfo) {
					if (targetType === fileInfo[key]) {
						onsuccess(true);
						break;
					}
				}
				onsuccess(false);
			}, onerror);
		}, arguments);
	};

	FileInfo.isBlob = isBlob;
	FileInfo.isFile = isFile;
	FileInfo.isSVGString = isSVGString;

	return FileInfo;

	function wrap(fn, args) {
		if (typeof args[1] === 'function') {
			fn(args[1], args[2], args[3]);
		} else {
			return new Promise(function (resolve, revoke) {
				fn(resolve, revoke);
			});
		}
	}

	/* log */
	function warn(input, idx) {
		DEBUG && console.warn('could not detect format', input, idx);
	}

	/* detect */
	function isBlob(input) {
		var type = Object.prototype.toString.call(input);
		return type === '[object Blob]' || type === '[object File]';
	}

	function isFile(input) {
		var type = Object.prototype.toString.call(input);
		return type === '[object File]';
	}

	function isSVGString(input) { // via vector.SVG.detect
		return input.startsWith('data:image/svg') ||
			   input.startsWith('<?xml') && input.includes('<svg') ||
			   input.startsWith('<svg');
	}

	/* detect via Blob */
	function fromBlob(blob, onsuccess, onerror) {
		var length = Math.min(5, blob.size);
		var slice = blob.slice(0, length);
		var reader = new FileReader();
		reader.onload = function (event) {
			var buffer = reader.result;
			var res = fromBuffer(buffer) || byMime[blob.type];
			if (res) {
				onsuccess(res);
			} else {
				onerror && onerror();
				warn(blob, 3);
			}
		};
		reader.readAsArrayBuffer(slice);
	}

	/* detect via ArrayBuffer */
	function fromBuffer(buffer) {
		if (buffer.byteLength > 4) {
			buffer = buffer.slice(0, 5);
		}

		var signature = bufferToHex(buffer);
		for (var sig in bySignature) {
			if (sig === signature.slice(0, sig.length)) {
				var ext = bySignature[sig];
				return byExtension[ext];
			}
		}
	}

	function bufferToHex(buffer) {
		var array = new Uint8Array(buffer);
		var hex = '';
		for (var i = 0; i < array.length; i ++) {
			var code = array[i].toString(16);
			if (code.length === 1) {
				hex += '0' + code;
			} else {
				hex += code;
			}
		}
		return hex;
	}

	/* detect via String */
	function fromString(string) {
		var lower = string.toLowerCase();
		if (string.startsWith('data:')) {
			var mime = lower.substr(5).split(';').shift();
			return byMime[mime];
		} else {
			var ext = lower.split('.').pop();
			if (byExtension[ext]) {
				return byExtension[ext];
			} else {
				if (isSVGString(string)) {
					return byExtension.svg;
				}
			}
		}
	}

	function fromExtension(ext) {
		return byExtension[ext];
	}

	function fromMime(mime) {
		return byMime[mime];
	}
})();