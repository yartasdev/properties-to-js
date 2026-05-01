export interface Options {
	input: string;
	output: string;
	flatted?: boolean;
	delimiter?: string;
	uppercase?: boolean;
	lowercase?: boolean;
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