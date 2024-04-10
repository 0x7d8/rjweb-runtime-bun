# `@rjweb/runtime-bun`

<img style="float: right;" alt="RJWEB Icon" height="104" src="https://cdn.rjns.dev/rjweb/icon.svg">

Bun Runtime using built-in features for [`rjweb-server`](https://npmjs.com/rjweb-server).

🏠 [Homepage](https://github.com/0x7d8/NPM_WEB-SERVER#readme)
🔍 [Documentation](https://server.rjweb.dev)

## Disclaimer

This Package is intended to be used in the backend. THIS PACKAGE WILL ONLY WORK WITH BUN.

- ✔️ ESM
- ✖️ CJS
- ✔️ Typescript

## Install

```sh
npm install @rjweb/runtime-bun
yarn add @rjweb/runtime-bun
pnpm add @rjweb/runtime-bun
bun install @rjweb/runtime-bun
```

## Example Usage

### Basic Server

```ts
import { Server } from "rjweb-server"
import { Runtime } from "@rjweb/runtime-bun"

const server = new Server(Runtime, {
  port: 8080 // https://server.rjweb.dev/types/ServerOptions
})

server.path('/', (path) => path
  .http('GET', '/', (http) => http
    .onRequest((ctr) => {
      return ctr.print('Hello World!')
    })
  )
)

server.start().then((port) => {
  console.log(`Server started on port ${port}!`)
})
```

[view more](https://npmjs.com/rjweb-server)

## Author

👤 **0x7d8**
🌐 [Website](https://rjansen.dev)
⭐ [GitHub](https://github.com/0x7d8)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
Feel free to check [issues page](https://github.com/0x7d8/rjweb-runtime-bun/issues).

## Show your support

Give a ⭐️ if this project helps you!

## 📝 License

Copyright © 2024 [0x7d8](https://github.com/0x7d8).
This project is MIT licensed.
