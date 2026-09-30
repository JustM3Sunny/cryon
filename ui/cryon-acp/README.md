# @aaif/cryon-acp

Install and resolve the Cryon executable through npm.

This package distributes the Cryon CLI using platform-specific optional npm
dependencies. It does not contain or depend on the Cryon ACP client.

## Installation

```bash
npm install @aaif/cryon-acp
```

The matching `@aaif/cryon-binary-*` package is installed automatically. Do not
install a platform package directly; `@aaif/cryon-acp` provides the supported
`cryon` command.

## Usage

Run the Cryon CLI installed by the package:

```bash
npx cryon acp
npx cryon serve
```

The launcher forwards arguments and standard input, output, and error streams to
the native executable. It preserves the executable's exit status and forwards
termination signals.

Resolve the executable path programmatically:

```typescript
import { resolveCryonBinary } from "@aaif/cryon-acp";

const binaryPath = resolveCryonBinary();
```

`resolveCryonBinary()` first uses `CRYON_BINARY` when it is set. Otherwise, it
selects the package matching `process.platform` and `process.arch`. In both
cases it verifies that the executable exists and returns an absolute path.

Use the override to run a locally built or custom Cryon executable:

```bash
CRYON_BINARY=/path/to/cryon npx cryon acp
```

`CRYON_BINARY` must point directly to a native Cryon executable, not a
`node_modules/.bin/cryon` command shim.

Supported platforms:

| Operating system | Architecture |
| ---------------- | ------------ |
| macOS            | ARM64        |
| macOS            | x64          |
| Linux            | ARM64        |
| Linux            | x64          |
| Windows          | x64          |

Package managers must install optional dependencies. If optional dependencies
are disabled, the resolver reports which platform package is missing.
