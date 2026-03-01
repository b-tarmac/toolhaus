# Toolhaus CLI

Developer tools in your terminal. Requires a [Toolhaus Pro](https://toolhaus.dev/pricing) subscription.

## Install

```bash
npm install -g @toolhaus/cli
```

## Setup

Configure your API key (get one at [toolhaus.dev/dashboard/api-keys](https://toolhaus.dev/dashboard/api-keys)):

```bash
toolhaus auth --key th_live_your_api_key_here
```

Or use the `TOOLHAUS_API_KEY` environment variable.

## Commands

| Command | Description |
|---------|-------------|
| `toolhaus auth` | Configure API key |
| `toolhaus uuid` | Generate UUID/ULID/NanoID |
| `toolhaus hash` | Generate MD5, SHA-256, etc. |
| `toolhaus case` | Convert text case |
| `toolhaus tokens` | Count LLM tokens |
| `toolhaus base64-encode` | Encode to Base64 |
| `toolhaus base64-decode` | Decode from Base64 |
| `toolhaus jwt` | Decode JWT |
| `toolhaus timestamp` | Convert timestamps |

## Examples

```bash
# Generate a UUID
toolhaus uuid

# Hash with SHA-256 (default)
echo "hello" | toolhaus hash

# Convert to camelCase
toolhaus case "hello world" --conversion camelCase

# Count tokens
echo "Hello, world!" | toolhaus tokens

# Base64 encode
echo "hello" | toolhaus base64-encode

# Decode JWT
toolhaus jwt eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Convert timestamp to human date
toolhaus timestamp 1709251200
```

## Options

- **Base URL**: Set `TOOLHAUS_BASE_URL` or `baseUrl` in `~/.toolhaus/config.json` for self-hosted instances.
- **Config file**: `~/.toolhaus/config.json`
