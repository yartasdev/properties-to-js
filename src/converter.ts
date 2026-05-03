import { green } from 'colorette';
import { extname, join, parse } from 'path';
import { flatten, unflatten } from 'flat';
import { readFileSync, writeFileSync } from 'fs';
import { JsonObject, Options, OptionsForContent, OptionsForFile } from './options';
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

	public static async convertForFile(options: OptionsForFile): Promise<void> {
		const content = this.read(options.input);
		const data = this.parse(content);
		const json = this.process(data, options);
		await this.save(json, options);
	}

	public static async convertForContent(options: OptionsForContent): Promise<string> {
		const data = this.parse(options.content);
		const json = this.process(data, options);
		return await this.format(json, options);
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

	private static async save(data: JsonObject, options: OptionsForFile): Promise<void> {
		const { output } = options;
		try {
			const result = await this.format(data, options);

			const { ext } = parse(output);

			if (ext !== `.${options.type}`) throw new Error(`Unsupported output type: ${ext}`);

			writeFileSync(join(process.cwd(), output), result);
			console.log(green(`Output file created successfully: ${output}`));
		} catch (error) {
			throw new Error(`Error while saving file: ${(error as Error).message}`);
		}
	}

	private static async format(data: JsonObject, options: Options): Promise<string> {
		switch (options.type) {
			case 'ts':
				return await this.toTypeScript(data);
			case 'js':
				return await this.toJavaScript(data);
			case 'json':
				return await this.toJSON(data);
			default:
				throw new Error(`Unsupported format: ${options.type}`);
		}
	}

	private static async toTypeScript(data: JsonObject): Promise<string> {
		const content = `export default ${JSON.stringify(data, null, 2)};\n`;
		return await format(content, {
			parser: 'typescript',
			...Converter.PRETTIER_OPTIONS,
		});
	}

	private static async toJavaScript(data: JsonObject): Promise<string> {
		const content = `module.exports = ${JSON.stringify(data, null, 2)};\n`;
		return await format(content, {
			parser: 'babel',
			...Converter.PRETTIER_OPTIONS,
		});
	}

	private static async toJSON(data: JsonObject): Promise<string> {
		const content = JSON.stringify(data, null, 2);
		return await format(content, {
			parser: 'json',
			...Converter.PRETTIER_OPTIONS,
		});
	}
}
