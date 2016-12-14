/*
	fileinfo : https://galactic.ink
*/

const DEBUG = false

function fileinfo(input) {
	return wrap((resolve, reject) => {
		if (typeof input === 'string') {
			const res = fromString(input)
			if (res) {
				resolve(res)
			} else {
				resolve(byExtension.png); //- fix me
				warn(input, 1)
			}
		} else {
			if (isBlob(input)) {
				fromBlob(input, resolve, handleError)
			} else {
				handleError()
				warn(input, 2)
			}
		}
		function handleError() {
			reject && reject({
				message: 'blobFromBuffer: format could not be determined'
			})
		}
	}, arguments)
}

fileinfo.fromBlob = fromBlob
fileinfo.fromBuffer = fromBuffer
fileinfo.fromString = fromString
fileinfo.fromExtension = fromExtension
fileinfo.fromMime = fromMime

fileinfo.is = function (input, targetType, onsuccess, onerror) {
	return wrap((onsuccess, onerror) => {
		fileinfo(input, fileInfo => {
			for (let key in fileInfo) {
				if (targetType === fileInfo[key]) {
					onsuccess(true)
					break
				}
			}
			onsuccess(false)
		}, onerror)
	}, arguments)
}

fileinfo.isBlob = isBlob
fileinfo.isFile = isFile
fileinfo.isSVGString = isSVGString

// References:
// http://en.wikipedia.org/wiki/List_of_file_bySignature
// http://www.filebySignature.net/

const bySignature = {
	/* image */
	'424d': 'bmp',
	'47494638': 'gif', // 47 49 46 38 37 61 (GIF87a) or 47 49 46 38 39 61 (GIF89a)
	'69636e73': 'icns', // http://en.wikipedia.org/wiki/Apple_Icon_Image_format
	'00000100': 'ico',
	'ffd8ff': 'jpg',
	'89504e47': 'png', // 89 50 4E 47 0D 0A 1A 0A
	'4d4d002a': 'tiff', // big endian format
	'49492a00': 'tiff', // little endian format
	'57454250': 'webp',

	/* audio */
	'464f524d': 'aiff', // 46 4F 52 4D nn nn nn nn 41 49 46 46
	'4d546864': 'mid', // 'MThd'
	'fffb': 'mp3',
	'494433': 'mp3',
	'4f676753': 'ogg',
	'52494646': 'wav', // 52 49 46 46 nn nn nn nn 57 41 56 45

	/* video */
	'000001b3': 'mpeg', // elementary stream (ES) // http://en.wikipedia.org/wiki/Elementary_stream
	'000001ba': 'mpeg', // program stream (PS) // http://en.wikipedia.org/wiki/MPEG_program_stream
	'1a45dfa3': 'webm',

	/* font */
	'4c50': 'eot',
	'00010000': 'ttf', // windows - 00 01 00 00 00
	'74727565': 'ttf', // mac
	'4f54544f': 'otf', // 4F 54 54 4F 00
	'774f4646': 'woff', // 77 4F 46 46 00 01 00 00
	'774f4632': 'woff2', // 77 4F 46 32 00 01 00 00

	/* package */
	'25504446': 'pdf', // '%PDF'
	'25215053': 'ps',  // '%!PS-Ado'
	'38425053': 'psd', // '8BPS'
	'7b5c7274': 'rtf', // '{\rtf1' - 7b 5c 72 74 66 31
	'504b0304': 'zip', // 'PK..' - archive
	'504b0506': 'zip', // 'PK..' - empty archive
	'504b0708': 'zip', // 'PK..' - spanned archive

	/* loose detection - keep at end of object */
	'7b': 'json' // '{'
}

const byExtension = (function () {
	const res = {
		/* text */
		json: {
			mime: 'application/json',
			type: 'text'
		},
		txt: {
			mime: 'text/plain',
			type: 'text'
		},

		/* image */
		bmp: {
			mime: 'image/bmp',
			type: 'image'
		},
		gif: {
			mime: 'image/gif',
			type: 'image'
		},
		icns: {
			mime: 'image/icns',
			type: 'image'
		},
		ico: {
			mime: 'image/x-icon',
			type: 'image'
		},
		jpeg: {
			mime: 'image/jpg',
			type: 'image'
		},
		jpg: {
			mime: 'image/jpg',
			type: 'image'
		},
		png: {
			mime: 'image/png',
			type: 'image'
		},
		tiff: {
			mime: 'image/tiff',
			type: 'image'
		},
		webp: {
			mime: 'image/webp',
			type: 'image'
		},

		/* audio */
		aiff: {
			mime: 'audio/aiff',
			type: 'audio'
		},
		mid: {
			mime: 'audio/mid',
			type: 'audio'
		},
		mp3: {
			mime: 'audio/mpeg',
			type: 'audio'
		},
		ogg: {
			mime: 'audio/ogg',
			type: 'audio'
		},
		wav: {
			mime: 'audio/wav',
			type: 'audio'
		},

		/* video */
		mp4: {
			mime: 'video/mp4',
			type: 'video'
		},
		mpeg: {
			mime: 'video/mpeg',
			type: 'video'
		},
		webm: {
			mime: 'video/webm',
			type: 'video'
		},

		/* clipart */
		svg: {
			mime: 'image/svg+xml',
			type: 'clipart'
		},

		/* font */
		eot: { // http://en.wikipedia.org/wiki/Embedded_OpenType
			mime: 'application/vnd.ms-fontobject',
			type: 'font'
		},
		otf: {
			mime: 'application/font-sfnt',
			type: 'font'
		},
		ttf: {
			mime: 'application/font-sfnt',
			type: 'font'
		},
		woff: {
			mime: 'application/font-woff',
			type: 'font'
		},
		woff2: {
			mime: 'application/font-woff',
			type: 'font'
		},

		/* package */
		pdf: {
			mime: 'application/pdf',
			type: 'package'
		},
		ps: {
			mime: 'application/postscript',
			type: 'package'
		},
		psd: {
			mime: 'image/vnd.adobe.photoshop',
			type: 'package'
		},
		rtf: {
			mime: 'application/rtf',
			type: 'package'
		},
		zip: {
			mime: 'application/zip',
			type: 'package'
		}
	}
	for (let ext in res) {
		res[ext].extension = ext
	}
	return res
})()

const byMime = (function () {
	const res = {}
	for (let ext in byExtension) {
		const item = byExtension[ext]
		res[item.mime] = item
	}
	return res
})()

function wrap(fn, options) {
	if (typeof options[1] === 'function') {
		fn(options[1], options[2], options[3])
	} else {
		return new Promise(fn)
	}
}

/* log */
function warn(input, idx) {
	DEBUG && console.warn('could not detect format', input, idx)
}

/* detect */
function isBlob(input) {
	const type = Object.prototype.toString.call(input)
	return type === '[object Blob]' || type === '[object File]'
}

function isFile(input) {
	const type = Object.prototype.toString.call(input)
	return type === '[object File]'
}

function isSVGString(input) { // via vector.SVG.detect
	return input.startsWith('data:image/svg') ||
		input.startsWith('<?xml') && input.includes('<svg') ||
		input.startsWith('<svg')
}

/* detect via Blob */
function fromBlob(blob, onsuccess, onerror) {
	const length = Math.min(5, blob.size)
	const slice = blob.slice(0, length)
	const reader = new FileReader()
	reader.onload = function (event) {
		const buffer = reader.result
		const res = fromBuffer(buffer) || byMime[blob.type]
		if (res) {
			onsuccess(res)
		} else {
			onerror && onerror()
			warn(blob, 3)
		}
	}
	reader.readAsArrayBuffer(slice)
}

/* detect via ArrayBuffer */
function fromBuffer(buffer) {
	if (buffer.byteLength > 4) {
		buffer = buffer.slice(0, 5)
	}

	const signature = bufferToHex(buffer)
	for (let sig in bySignature) {
		if (sig === signature.slice(0, sig.length)) {
			const ext = bySignature[sig]
			return byExtension[ext]
		}
	}
}

function bufferToHex(buffer) {
	const array = new Uint8Array(buffer)
	let hex = ''
	for (let i = 0; i < array.length; i++) {
		const code = array[i].toString(16)
		if (code.length === 1) {
			hex += '0' + code
		} else {
			hex += code
		}
	}
	return hex
}

/* detect via String */
function fromString(string) {
	const lower = string.toLowerCase()
	if (string.startsWith('data:')) {
		const mime = lower.substr(5).split(';').shift()
		return byMime[mime]
	}

	const ext = lower.split('.').pop()
	if (byExtension[ext]) {
		return byExtension[ext]
	} else {
		if (isSVGString(string)) {
			return byExtension.svg
		}
	}
}

function fromExtension(ext) {
	return byExtension[ext]
}

function fromMime(mime) {
	return byMime[mime]
}

module.exports = fileinfo