import { ImplementationHttpContext, Method, ValueCollection, ImplementationWebsocketData } from "rjweb-server"
import { Server, SocketAddress } from "bun"
import { Readable, Transform } from "stream"
import { compressionStream, compressionSync } from "@/functions/compression"

class ArrayBufferToBufferTransformer extends Transform {
	_transform(chunk: ArrayBuffer, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
		callback(null, Buffer.from(chunk))
	}
}

export class HttpContext extends ImplementationHttpContext {
	public responseContent: any = Bun.allocUnsafe(0)
	public responseInit = {
		headers: new Headers() as any,
		status: 200,
		statusText: 'OK'
	} satisfies Bun.ResponseInit
	private ip: SocketAddress | null

	constructor(private req: Request, private server: Server) {
		super()

		this.ip = server.requestIP(req)
	}

	public aborted(): AbortSignal {
		return this.req.signal
	}

	public type(): 'http' | 'ws' {
		return this.req.headers.has('upgrade') && this.req.method.toUpperCase() === 'GET' ? 'ws' : 'http'
	}

	public method(): Method {
		return this.req.method as any
	}

	public path(): string {
		return this.req.url.slice(this.req.url.indexOf('/', 8))
	}

	public clientIP(): string {
		return this.ip?.address ?? '127.0.0.1'
	}

	public clientPort(): number {
		return this.ip?.port ?? -1
	}

	public async onBodyChunk(callback: (chunk: ArrayBuffer, isLast: boolean) => Promise<any>): Promise<void> {
		if (!this.req.body) {
			callback(Bun.allocUnsafe(0).buffer as ArrayBuffer, true)
			return
		}

		const reader = this.req.body.getReader()
		while (true) {
			const data = await reader.read()

			await callback(data.value ?? Bun.allocUnsafe(0), data.done)
			if (data.done) break
		}
	}

	public getHeaders(): ValueCollection<string, string> {
		return new ValueCollection(Object.fromEntries(this.req.headers.entries()) as any)
	}

	public status(code: number, message: string): this {
		this.responseInit.status = code
		this.responseInit.statusText = message

		return this
	}

	public header(key: string, value: string): this {
		this.responseInit.headers.append(key, value)

		return this
	}

	public async write(data: ArrayBuffer | Readable): Promise<void> {
		this.compressionHeader(data instanceof Readable)
		if (this.responseInit.headers.get('content-encoding') === 'br') this.responseInit.headers.delete('content-encoding')

		if (data instanceof ArrayBuffer) {
			this.responseContent = await compressionSync(this.getCompression(), Buffer.from(data))
		} else {
			this.responseContent = compressionStream(this.getCompression(), data.pipe(new ArrayBufferToBufferTransformer()))
		}
	}

	public writeFile(file: string, start?: number, end?: number): void {
		this.responseContent = Bun.file(file).slice(start, end)
	}

	public upgrade(data: ImplementationWebsocketData): boolean {
		return this.server.upgrade(this.req, {
			headers: this.responseInit.headers.entries(),
			data
		})
	}
}