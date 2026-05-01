import { green } from 'colorette';
import { extname, join } from 'path';
import { flatten, unflatten } from 'flat';
import { readFileSync, writeFileSync } from 'fs';
import { JsonObject, Options } from './options';
import { Options as PrettierOptions, format } from 'prettier';

export class Converter {
	private static readonly MULTILINE_REGEX = /\\\n[ \t]*/g;
	private static readonly UNICODE_REGEX = /\\u([0-9a-fA-F]{4})/g;
	private static readonly ESCAPE_REGEX = /\\([=:!# ])/g;
	private static readonly ASSIGNMENT_REGEX = /(?<!\\)[=:]/;

	private static readonly PRETTIER_OPTIONS: PrettierOptions = {
		semi: true,
		singleQuote: true,
		trailingComma: 'all',
		printWidth: 80,
		tabWidth: 2,
		useTabs: true,
	};

	public static async convert(options: Options): Promise<void> {
		const content = this.read(options.input);
		const data = this.parse(content);
		const json = this.process(data, options);
		await this.save(json, options);
	}

	private static parse(content: string): JsonObject {
		const json: JsonObject = {};

		content
			.replace(Converter.MULTILINE_REGEX, '')
			.split(/\r?\n/)
			.map(line => line.trim())
			.filter(line => this.isValidLine(line))
			.forEach(line => {
				const splitter = line.search(Converter.ASSIGNMENT_REGEX);
				if (splitter === -1) return;

				const key = this.unescape(line.substring(0, splitter).trim());
				const value = this.unescape(line.substring(splitter + 1).trim());

				json[key] = value;
			});

		return json;
	}

	private static process(data: JsonObject, options: Options): JsonObject {
		const { uppercase, lowercase, flatted, delimiter } = options;

		if (flatted) {
			return flatten(unflatten(data), { delimiter, transformKey: key => (uppercase ? key.toUpperCase() : lowercase ? key.toLowerCase() : key) });
		}
		return unflatten(data, { transformKey: key => (uppercase ? key.toUpperCase() : lowercase ? key.toLowerCase() : key) });
	}

	private static isValidLine(line: string): boolean {
		return line.length > 0 && !line.startsWith('#') && !line.startsWith('!');
	}

	private static unescape(str: string): string {
		return str
			.replace(Converter.UNICODE_REGEX, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\t/g, '\t')
			.replace(Converter.ESCAPE_REGEX, '$1');
	}

	private static read(input: string): string {
		try {
			const filePath = join(process.cwd(), input);
			return readFileSync(filePath, 'utf-8');
		} catch (error) {
			throw new Error(`File read error: ${input} - ${(error as Error).message}`);
		}
	}

	private static async save(data: JsonObject, options: Options): Promise<void> {
		const { output } = options;

		try {
			const extension = extname(output).toLowerCase();

			switch (extension) {
				case '.ts':
					await this.toTypeScript(data, output);
					break;
				case '.js':
					await this.toJavaScript(data, output);
					break;
				case '.json':
					await this.toJSON(data, output);
					break;
				default:
					throw new Error(`Unsupported output type: ${extension}`);
			}
			console.log(green(`File saved successfully: ${output}`));
		} catch (error) {
			throw new Error(`Error while saving file: ${(error as Error).message}`);
		}
	}

	private static async toTypeScript(data: JsonObject, output: string): Promise<void> {
		const content = `export default ${JSON.stringify(data, null, 2)};\n`;
		const formatted = await format(content, {
			parser: 'typescript',
			...Converter.PRETTIER_OPTIONS,
		});
		writeFileSync(join(process.cwd(), output), formatted);
	}

	private static async toJavaScript(data: JsonObject, output: string): Promise<void> {
		const content = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
		const formatted = await format(content, {
			parser: 'babel',
			...Converter.PRETTIER_OPTIONS,
		});
		writeFileSync(join(process.cwd(), output), formatted);
	}

	private static async toJSON(data: JsonObject, output: string): Promise<void> {
		const content = JSON.stringify(data, null, 2);
		const formatted = await format(content, {
			parser: 'json',
			...Converter.PRETTIER_OPTIONS,
		});
		writeFileSync(join(process.cwd(), output), formatted);
	}
}
