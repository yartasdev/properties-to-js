/**
 * Browser-safe subset of Converter logic (no fs / prettier).
 * Kept in sync with src/converter.ts parse + process behaviour.
 */
import { flatten, unflatten } from 'flat';

export type OutputType = 'json' | 'ts' | 'js';

export interface ConvertOptions {
	content: string;
	type: OutputType;
	flatted?: boolean;
	delimiter?: string;
	uppercase?: boolean;
	lowercase?: boolean;
}

const MULTILINE_REGEX = /\\\n[ \t]*/g;
const UNICODE_REGEX = /\\u([0-9a-fA-F]{4})/g;
const ESCAPE_REGEX = /\\([=:!# ])/g;
const ASSIGNMENT_REGEX = /(?<!\\)[=:]/;

type JsonObject = Record<string, string>;

function isValidLine(line: string): boolean {
	return line.length > 0 && !line.startsWith('#') && !line.startsWith('!');
}

function unescape(str: string): string {
	return str
		.replace(UNICODE_REGEX, (_, hex: string) =>
			String.fromCharCode(parseInt(hex, 16)),
		)
		.replace(/\\n/g, '\n')
		.replace(/\\r/g, '\r')
		.replace(/\\t/g, '\t')
		.replace(ESCAPE_REGEX, '$1');
}

export function parseProperties(content: string): JsonObject {
	const json: JsonObject = {};

	content
		.replace(MULTILINE_REGEX, '')
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => isValidLine(line))
		.forEach((line) => {
			const splitter = line.search(ASSIGNMENT_REGEX);
			if (splitter === -1) return;

			const key = unescape(line.substring(0, splitter).trim());
			const value = unescape(line.substring(splitter + 1).trim());

			json[key] = value;
		});

	return json;
}

function process(
	data: JsonObject,
	options: Pick<
		ConvertOptions,
		'uppercase' | 'lowercase' | 'flatted' | 'delimiter'
	>,
): Record<string, unknown> {
	const { uppercase, lowercase, flatted, delimiter = '.' } = options;
	if (flatted) {
		return flatten(unflatten(data), {
			delimiter,
			transformKey: (key: string) =>
				uppercase ? key.toUpperCase() : lowercase ? key.toLowerCase() : key,
		}) as Record<string, unknown>;
	}
	return unflatten(data, {
		transformKey: (key: string) =>
			uppercase ? key.toUpperCase() : lowercase ? key.toLowerCase() : key,
	}) as Record<string, unknown>;
}

function formatOutput(
	data: Record<string, unknown>,
	type: OutputType,
): string {
	const body = JSON.stringify(data, null, 2);
	switch (type) {
		case 'ts':
			return `export default ${body};\n`;
		case 'js':
			return `module.exports = ${body};\n`;
		default:
			return `${body}\n`;
	}
}

export function convertProperties(options: ConvertOptions): string {
	const { content, type, ...rest } = options;
	const parsed = parseProperties(content);
	const json = process(parsed, rest);
	return formatOutput(json, type);
}
