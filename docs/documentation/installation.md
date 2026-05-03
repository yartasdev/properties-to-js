# Installation

## As a project dependency

```bash
npm install @yartasdev/properties-to-js
```

## Global CLI

```bash
npm install -g @yartasdev/properties-to-js
```

The `properties-to-js` command is then available on your PATH.

## npx (no install)

```bash
npx @yartasdev/properties-to-js -i config.properties -o config.json
```

If your shell mishandles flags, insert `--`:

```bash
npx @yartasdev/properties-to-js -- -i config.properties -o config.json
```

With a local install, from the project root:

```bash
npx properties-to-js -i config.properties -o config.json
```

## Development

After cloning the repository:

```bash
npm install
npm run build
npm test
```

Use `npm link` to try the CLI locally.
