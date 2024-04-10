import { version as packageVersion } from "package.json"
export const version: string = packageVersion

import { Implementation, ImplementationHandleRecord, ImplementationWebsocketData } from "rjweb-server"
import { HttpContext } from "@/contexts/http"
import { WsContext } from "@/contexts/ws"
import { Server, WebSocketServeOptions } from "bun"

const decoder = new TextDecoder('utf8')

export class Runtime extends Implementation {
	private server: Server | null = null
	private serve: WebSocketServeOptions<ImplementationWebsocketData> = {
		fetch: async () => new Response('Not implemented', { status: 501 }),
		websocket: { message: () => undefined, publishToSelf: true }
	}

	public name(): string {
		return '@rjweb/runtime-bun'
	}

	public version(): string {
		return version
	}

	public port(): number {
		return this.server?.port ?? 0
	}

	public start(): Promise<void> {
		this.serve.port = this.options.port

		return new Promise((resolve) => {
			this.serve.hostname = this.options.bind
			this.server = Bun.serve(this.serve)

			resolve()
		})
	}

	public stop(): void {
		this.server!.stop(true)
		this.server = null
	}

	public handle(handlers: { [key in keyof ImplementationHandleRecord]: (context: ImplementationHandleRecord[key]) => Promise<any> }): void {
		this.serve.fetch = async(request) => {
			const context = new HttpContext(request, this.server!)

			await Promise.resolve(handlers.http(context))

			return new Response(context.responseContent, context.responseInit)
		}

		this.serve.websocket.message = (ws, message) => {
			const context = new WsContext('m', ws, message)

			return Promise.resolve(handlers.ws(context))
		}

		this.serve.websocket.open = (ws) => {
			const context = new WsContext('o', ws, Bun.allocUnsafe(0).buffer as ArrayBuffer)

			return Promise.resolve(handlers.ws(context))
		}

		this.serve.websocket.close = (ws) => {
			const context = new WsContext('c', ws, Bun.allocUnsafe(0).buffer as ArrayBuffer)

			return Promise.resolve(handlers.ws(context))
		}
	}

	public wsPublish(type: 'text' | 'binary', id: number, data: ArrayBuffer, compressed: boolean): void {
		this.server!.publish(id.toString(), type === 'text' ? decoder.decode(data) : data, compressed)
	}
}