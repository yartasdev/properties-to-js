import { test, describe, before, afterEach } from 'node:test';
import assert from 'node:assert';
import { mock } from 'node:test';
import fs from 'node:fs';
import { Converter } from './converter'; // Dosya yoluna göre düzenle

describe('Converter Class Tests', () => {
	const readFileSyncMock = mock.method(fs, 'readFileSync', () => {});
	const writeFileSyncMock = mock.method(fs, 'writeFileSync', () => {});

	afterEach(() => {
		readFileSyncMock.mock.resetCalls();
		writeFileSyncMock.mock.resetCalls();
	});

	test('should parse a simple properties content correctly', () => {
		const content = 'app.name=TestApp\napp.version=1.0.0';
		const result = (Converter as any).parse(content);

		assert.deepStrictEqual(result, {
			'app.name': 'TestApp',
			'app.version': '1.0.0',
		});
	});

	test('should handle hierarchical processing (unflatten)', () => {
		const data = { 'server.port': '8080', 'server.host': 'localhost' };
		const options = { flatted: false, uppercase: false, lowercase: false };

		const result = (Converter as any).process(data, options);

		assert.deepStrictEqual(result, {
			server: {
				port: '8080',
				host: 'localhost',
			},
		});
	});

	test('should handle flattening with custom delimiter and uppercase', () => {
		const data = { 'database.host': 'localhost' };
		const options = { flatted: true, delimiter: '_', uppercase: true, lowercase: false };

		const result = (Converter as any).process(data, options);

		assert.deepStrictEqual(result, {
			DATABASE_HOST: 'localhost',
		});
	});

	test('should escape special characters and unicode correctly', () => {
		const escaped = (Converter as any).unescape('Hello\\u0020World\\nLine2');
		assert.strictEqual(escaped, 'Hello World\nLine2');
	});

	test('should successfully call save for .json extension', async () => {
		const data = { test: 'value' };
		const options = { output: 'test.json' } as any;
		let calledPath = '';
		let calledContent = '';

		mock.method(fs, 'writeFileSync', (path: string, content: string) => {
			calledPath = path;
			calledContent = content;
		});

		await (Converter as any).save(data, options);

		assert.ok(calledPath.includes('test.json'), 'Path should contain test.json');
		assert.ok(calledContent.includes('"test": "value"'), 'Content should contain the data');
	});

	test('should throw error for unsupported output types', async () => {
		const data = { test: 'value' };
		const options = { output: 'test.txt' } as any;

		await assert.rejects(
			async () => {
				await (Converter as any).save(data, options);
			},
			{
				message: /Unsupported output type: .txt/,
			},
		);
	});
});
