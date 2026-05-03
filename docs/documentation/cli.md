# CLI

Binary name: **`properties-to-js`**

## Required flags

| Long | Short | Description |
| ---- | ----- | ----------- |
| `--input` | `-i` | Path to the input `.properties` file |
| `--output` | `-o` | Output file path; extension must be `.js`, `.ts`, or `.json` |

## Optional flags

| Long | Short | Default | Description |
| ---- | ----- | ------- | ----------- |
| `--type` | `-t` | `json` | Output type: `json`, `js`, `ts` |
| `--delimiter` | `-d` | `.` | Delimiter for flattened keys |
| `--flatted` | `-f` | off | Collapse nested structure to single-level keys |
| `--uppercase` | `-u` | off | Uppercase all keys |
| `--lowercase` | `-l` | off | Lowercase all keys |

`--uppercase` and `--lowercase` are not meant to be used together; pick one.

## Examples

```bash
properties-to-js -i config.properties -o config.js
properties-to-js -i config.properties -o config.ts -t ts
properties-to-js -i config.properties -o config.json -t json
properties-to-js -i config.properties -o out.js -f -d "_" -u
```

## Output file and `--type`

The file extension must match `--type`; otherwise saving throws (for example `-o out.json` with `-t json`).
