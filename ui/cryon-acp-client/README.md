# @aaif/cryon-acp-client

TypeScript client library for communicating with Cryon over an existing Agent
Client Protocol (ACP) transport.

This package provides:

- TypeScript types and Zod validators for Cryon ACP extension methods
- `CryonExtClient` for calling Cryon extension methods
- Client capability definitions and MCP Apps helpers

It does not install, resolve, or start the Cryon executable. Applications own
the transport and process lifecycle.

## Installation

```bash
npm install @aaif/cryon-acp-client @agentclientprotocol/sdk
```

## Usage

Compose the Cryon extension client with the standard ACP SDK:

```typescript
import {
  client as createAcpClient,
  methods,
  PROTOCOL_VERSION,
  type Stream,
} from "@agentclientprotocol/sdk";
import { CryonExtClient } from "@aaif/cryon-acp-client";

async function connectToCryon(stream: Stream) {
  const app = createAcpClient({ name: "my-product" });
  const connection = app.connect(stream);
  const cryon = new CryonExtClient(connection.agent);

  await connection.agent.request(methods.agent.initialize, {
    protocolVersion: PROTOCOL_VERSION,
    clientInfo: {
      name: "my-product",
      version: "1.0.0",
    },
    clientCapabilities: {},
  });

  return { connection, cryon };
}
```

The application creates and owns the `stream`, including its connection and
process lifecycle. Call `connection.close()` when the application no longer
needs the connection.

## Development

From `ui/cryon-acp-client`:

```bash
pnpm run build
```

The generated TypeScript types come from the Rust schemas in `crates/cryon`.
