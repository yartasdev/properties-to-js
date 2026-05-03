# Options

## Shared options (`Options`)

The CLI and `Converter` methods share the same behaviour.

| Field | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `type` | `'json' \| 'js' \| 'ts'` | — | Output format |
| `flatted` | `boolean` | `false` | When `true`, run `unflatten` then `flatten` for single-level keys |
| `delimiter` | `string` | `'.'` | Delimiter when joining keys for flattening |
| `uppercase` | `boolean` | `false` | Uppercase keys |
| `lowercase` | `boolean` | `false` | Lowercase keys |

## `convertForFile` (`OptionsForFile`)

| Field | Description |
| ----- | ----------- |
| `input` | Path to the `.properties` file to read |
| `output` | Path to write (extension must match `type`) |

Plus the shared fields above.

## `convertForContent` (`OptionsForContent`)

| Field | Description |
| ----- | ----------- |
| `content` | Full `.properties` source text |

Plus shared fields (`type`, `flatted`, …).

> **Note:** If you see extra fields on `OptionsForContent` in TypeScript definitions, only `content` and the shared options are used at runtime.
