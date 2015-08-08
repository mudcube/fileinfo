/*
	-------------------------------------------------------
	fileinfo : 0.1.1 : 2015-07-06 : https://mudcu.be
	-------------------------------------------------------
	references
		* http://en.wikipedia.org/wiki/List_of_file_bySignature
		* http://www.filebySignature.net/
	-------------------------------------------------------
*/

var FileInfo = (function() {
	var byExtension = (function() {
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
	
	var byMime = (function() {
		var res = {};
		for (var ext in byExtension) {
			var item = byExtension[ext];
			res[item.mime] = item;
		}
		return res;
	})();

	var bySignature = {
		/* image */
		'424d':     'bmp',
		'47494638': 'gif', 
			// 47 49 46 38 37 61 (GIF87a)
			// 47 49 46 38 39 61 (GIF89a)
		'69636e73': 'icns', // http://en.wikipedia.org/wiki/Apple_Icon_Image_format
		'00000100': 'ico',
		'ffd8ff':   'jpg',
		'89504e47': 'png',
			// 89 50 4E 47 0D 0A 1A 0A
		'4d4d002a': 'tiff', // big endian format
		'49492a00': 'tiff', // little endian format
		'57454250': 'webp',

		/* audio */
		'464f524d': 'aiff',
			// 46 4F 52 4D nn nn nn nn 41 49 46 46
		'4d546864': 'mid',
		'fffb':     'mp3',
		'494433':   'mp3',
		'4f676753': 'ogg',
		'52494646': 'wav',
			// 52 49 46 46 nn nn nn nn 57 41 56 45	

		/* video */
		'000001b3': 'mpeg', // elementary stream (ES) // http://en.wikipedia.org/wiki/Elementary_stream
		'000001ba': 'mpeg', // program stream (PS) // http://en.wikipedia.org/wiki/MPEG_program_stream
		'1a45dfa3': 'webm',

		/* font */
		'4c50':     'eot',
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
		'25504446': 'pdf',
		'25215053': 'ps',
		'38425053': 'psd',
		'7b5c7274': 'rtf',
			// 7b 5c 72 74 66
		'504b0304': 'zip', // archive
		'504b0506': 'zip', // empty archive
		'504b0708': 'zip'  // spanned archive
	};
	
	function FileInfo(data, onsuccess, onerror) {
		if (typeof onsuccess !== 'function') {
			throw 'onsuccess must be a function';
		}
		///
		if (typeof data === 'string') {
			var res = detectFromString(data);
			if (res) {
				onsuccess(res);
			} else {
				onsuccess(byExtension.png);
				warn(data);
			}
		} else {
			if (isBlob(data)) {
				if (data.size >= 4) {
					var blob = data.slice(0, 4);
					var reader = new FileReader();
					reader.onload = function(event) {
						handleArrayBuffer(reader.result);
					};
					reader.readAsArrayBuffer(blob);
					return;
				}
			} else if (isBuffer(data)) {
				if (data.length >= 4) {
					handleArrayBuffer(data.slice(0, 4));
					return;
				}
			}
			///
			onerror && onerror();
			warn(data);
		}
		///
		function handleArrayBuffer(buf) {
			var res = detectFromBuffer(buf) || byMime[data.type];
			if (res) {
				onsuccess(res);
			} else {
				onerror && onerror();
				warn(data);
			}
		};
	};
	
	FileInfo.byExtension = byExtension;
	FileInfo.byMime = byMime;
	FileInfo.isBlob = isBlob;
	FileInfo.isSVGString = isSVGString;
	
	return FileInfo;
	
	/* log */
	function warn(data) {
		console.warn('could not detect format', data);
	};

	/* detect */
	function isBlob(data) {
		var type = Object.prototype.toString.call(data);
		return type === '[object Blob]' || type === '[object File]';
	};

	function isBuffer(data) {
		return typeof Buffer !== 'undefined' && data instanceof Buffer;
	};

	function isSVGString(data) { // via vector.SVG.detect
		return data.startsWith('data:image/svg') || 
			   data.startsWith('<?xml') || 
			   data.startsWith('<svg');
	};

	/* detect via ArrayBuffer */
	function detectFromBuffer(buffer) {
		var signature = bufferToHex(buffer);
		for (var sig in bySignature) {
			if (sig === signature.slice(0, sig.length)) {
				var ext = bySignature[sig];
				return byExtension[ext];
			}
		}
	};

	function bufferToHex(buffer) {
		var array = new Uint8Array(buffer);
		var res = '';
		for (var i = 0; i < array.length; i ++) {
			res += array[i].toString(16);
		}
		return res;
	};

	/* detect via String */
	function detectFromString(string) {
		var ext = string.toLowerCase().split('.').pop();
		if (byExtension[ext]) {
			return byExtension[ext];
		} else {
			if (isSVGString(string)) {
				return byExtension.svg;
			}
		}
	};
})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = FileInfo;
}