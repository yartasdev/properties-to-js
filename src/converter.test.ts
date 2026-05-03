import { afterEach, describe, mock, test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { Converter } from './converter';

describe('Converter', () => {
	afterEach(() => {
		mock.restoreAll();
	});

	describe('parse', () => {
		test('parses simple key=value', () => {
			const result = (Converter as any).parse('app.name=TestApp\napp.version=1.0.0');
			assert.deepStrictEqual(result, {
				'app.name': 'TestApp',
				'app.version': '1.0.0',
			});
		});

		test('ignores # and ! comments and blank lines', () => {
			const result = (Converter as any).parse(
				'\n  # c1\n! c2\n\nkey=value\n',
			);
			assert.deepStrictEqual(result, { key: 'value' });
		});

		test('supports key:value assignment', () => {
			const result = (Converter as any).parse('host:localhost');
			assert.deepStrictEqual(result, { host: 'localhost' });
		});

		test('skips lines without assignment delimiter', () => {
			const result = (Converter as any).parse('noequalsign\na=1');
			assert.deepStrictEqual(result, { a: '1' });
		});

		test('joins multiline continuation (backslash + newline)', () => {
			const result = (Converter as any).parse('msg=hello \\\n    world');
			assert.deepStrictEqual(result, { msg: 'hello world' });
		});
	});

	describe('unescape', () => {
		test('handles unicode, newline, carriage return, tab', () => {
			const u = (Converter as any).unescape('A\\u0020B\\nC\\rD\\tE');
			assert.strictEqual(u, 'A B\nC\rD\tE');
		});

		test('handles escaped special chars', () => {
			const u = (Converter as any).unescape('\\=\\:\\!\\#\\ ');
			assert.strictEqual(u, '=:!# ');
		});
	});

	describe('process', () => {
		test('unflattens dotted keys', () => {
			const data = { 'server.port': '8080', 'server.host': 'localhost' };
			const result = (Converter as any).process(data, {
				flatted: false,
				uppercase: false,
				lowercase: false,
			});
			assert.deepStrictEqual(result, {
				server: { port: '8080', host: 'localhost' },
			});
		});

		test('unflatten with lowercase keys', () => {
			const data = { 'App.Name': 'x' };
			const result = (Converter as any).process(data, {
				flatted: false,
				uppercase: false,
				lowercase: true,
			});
			assert.deepStrictEqual(result, { app: { name: 'x' } });
		});

		test('unflatten with uppercase keys', () => {
			const data = { 'app.name': 'x' };
			const result = (Converter as any).process(data, {
				flatted: false,
				uppercase: true,
				lowercase: false,
			});
			assert.deepStrictEqual(result, { APP: { NAME: 'x' } });
		});

		test('flattens with delimiter and lowercase', () => {
			const data = { 'db.host': 'h' };
			const result = (Converter as any).process(data, {
				flatted: true,
				delimiter: '|',
				uppercase: false,
				lowercase: true,
			});
			assert.deepStrictEqual(result, { 'db|host': 'h' });
		});

		test('flattens with default delimiter when omitted', () => {
			const data = { 'a.b': '1' };
			const result = (Converter as any).process(data, {
				flatted: true,
				uppercase: false,
				lowercase: false,
			});
			assert.deepStrictEqual(result, { 'a.b': '1' });
		});
	});

	describe('read', () => {
		test('throws with file read error message', () => {
			mock.method(fs, 'readFileSync', () => {
				throw new Error('ENOENT');
			});
			assert.throws(
				() => (Converter as any).read('missing.properties'),
				/File read error: missing.properties - ENOENT/,
			);
		});
	});

	describe('save', () => {
		test('writes formatted JSON for .json output', async () => {
			mock.method(console, 'log', () => {});
			const data = { test: 'value' };
			let calledPath = '';
			let calledContent = '';
			mock.method(fs, 'writeFileSync', (path: string, content: string) => {
				calledPath = path;
				calledContent = content;
			});

			await (Converter as any).save(data, { output: 'test.json', type: 'json' });

			assert.ok(calledPath.includes('test.json'));
			assert.ok(calledContent.includes('"test"'));
			assert.ok(calledContent.includes('"value"'));
		});

		test('rejects when output extension does not match type', async () => {
			await assert.rejects(
				() =>
					(Converter as any).save({ a: '1' }, { output: 'out.txt', type: 'json' }),
				/Unsupported output type: .txt/,
			);
		});

		test('rejects when format type is unsupported', async () => {
			await assert.rejects(
				() =>
					(Converter as any).save(
						{ a: '1' },
						{ output: 'out.json', type: 'xml' as any },
					),
				/Unsupported format: xml/,
			);
		});
	});

	describe('convertForContent', () => {
		test('returns formatted JSON', async () => {
			const out = await Converter.convertForContent({
				content: 'k=v',
				type: 'json',
			});
			assert.match(out, /"k"/);
			assert.match(out, /"v"/);
		});

		test('returns JavaScript module string', async () => {
			const out = await Converter.convertForContent({
				content: 'x=1',
				type: 'js',
			});
			assert.ok(out.includes('module.exports'));
			assert.ok(out.includes('x'));
		});

		test('returns TypeScript default export string', async () => {
			const out = await Converter.convertForContent({
				content: 'y=z',
				type: 'ts',
			});
			assert.ok(out.includes('export default'));
			assert.ok(out.includes('y'));
		});

		test('applies flatted and uppercase', async () => {
			const out = await Converter.convertForContent({
				content: 'a.b=c',
				type: 'json',
				flatted: true,
				delimiter: '_',
				uppercase: true,
			});
			assert.ok(out.includes('A_B'));
		});
	});

	describe('convertForFile', () => {
		test('reads input, converts, and writes output', async () => {
			mock.method(fs, 'readFileSync', () => 'one=two\n');
			let written = '';
			mock.method(fs, 'writeFileSync', (_p: string, content: string) => {
				written = content;
			});
			const log = mock.method(console, 'log', () => {});

			await Converter.convertForFile({
				input: 'in.properties',
				output: 'out.json',
				type: 'json',
			});

			assert.ok(written.includes('one'));
			assert.ok(written.includes('two'));
			assert.strictEqual(log.mock.callCount(), 1);
		});

		test('propagates read errors', async () => {
			mock.method(fs, 'readFileSync', () => {
				throw new Error('boom');
			});
			await assert.rejects(
				() =>
					Converter.convertForFile({
						input: 'bad.properties',
						output: 'out.json',
						type: 'json',
					}),
				/File read error: bad.properties - boom/,
			);
		});
	});
});
