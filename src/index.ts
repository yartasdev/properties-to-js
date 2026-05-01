#!/usr/bin/env node

import { Command } from 'commander';
import { Converter } from './converter';

const program = new Command('ptj');
program.alias('properties-to-js');
program.description('A CLI tool to convert .properties files to JavaScript objects. Supports JSON, JS, and TS output formats with options for flattening and case transformation.');
program.version('1.0.0');
program.requiredOption('-i, --input <path>', 'Path to the .properties file');
program.requiredOption('-o, --output <path>', 'Path to the output file, including extension (.js, .ts, .json) E.g.: output.js or output.ts or output.json');
program.option('-d, --delimiter <delimiter>', 'Delimiter for flattening nested keys', '.');
program.option('-f, --flatted', 'Flatted nested keys into a single level with delimiter notation', false);
program.option('-u, --uppercase', 'Convert all keys to uppercase', false);
program.option('-l, --lowercase', 'Convert all keys to lowercase', false);

program.parse();

Converter.convert(program.opts());