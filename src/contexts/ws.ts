import { ImplementationWsContext, ImplementationWebsocketData } from "rjweb-server"
import { ServerWebSocket } from "bun"

const decoder = new TextDecoder('utf8')

export class WsContext extends ImplementationWsContext {
	constructor(private _realType: 'o' | 'm' | 'c', private ws: ServerWebSocket<ImplementationWebsocketData>, private _message: ArrayBuffer | Buffer | string) {
		super()
	}

	public type(): 'open' | 'message' | 'close' {
		return this._realType === 'o' ? 'open' : this._realType === 'm' ? 'message' : 'close'
	}

	public write(type: 'text' | 'binary', data: ArrayBuffer, compressed: boolean): void {
		this.ws.send(type === 'text' ? decoder.decode(data) : data, compressed)
	}

	public close(code?: number | undefined, reason?: string | undefined): void {
		this.ws.close(code, reason)
	}


	public message(): string | ArrayBuffer | Buffer {
		return this._message
	}

	public messageType(): 'text' | 'binary' {
		return typeof this._message === 'string' ? 'text' : 'binary'
	}


	public subscribe(id: number): void {
		this.ws.subscribe(id.toString())
	}

	public unsubscribe(id: number): void {
		this.ws.unsubscribe(id.toString())
	}


	public data(): ImplementationWebsocketData {
		return this.ws.data
	}
}