import { Readable, pipeline } from "stream"
import * as zlib from "zlib"

const errFn = () => undefined

export function compressionStream(method: 'gzip' | 'brotli' | 'deflate' | null, source: Readable): Readable {
	switch (method) {
		case "gzip":
			return pipeline(source, zlib.createGzip(), errFn)
		case "deflate":
			return pipeline(source, zlib.createDeflate(), errFn)
		default:
			return source
	}
}

export function compressionSync(method: 'gzip' | 'brotli' | 'deflate' | null, data: Buffer): Promise<Buffer> {
	switch (method) {
		case "gzip":
			return new Promise((resolve, reject) => zlib.gzip(data, (err, result) => err ? reject(err) : resolve(result)))
		case "deflate":
			return new Promise((resolve, reject) => zlib.deflate(data, (err, result) => err ? reject(err) : resolve(result)))
		default:
			return Promise.resolve(data)
	}
}