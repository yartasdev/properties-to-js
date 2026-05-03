export interface Options {
	flatted?: boolean;
	delimiter?: string;
	uppercase?: boolean;
	lowercase?: boolean;
  type: 'json' | 'ts' | 'js';
}

export interface OptionsForContent extends Omit<Options, 'input' | 'output'> {
  content: string;
}

export interface OptionsForFile extends Omit<Options, 'input' | 'output'> {
  input: string;
  output: string;
}

export type JsonValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JsonObject 
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export interface JsonArray extends Array<JsonValue> {}