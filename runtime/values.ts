import { Stmt } from "../frontend/ast.ts";
import Environment from "./environment.ts";

export type ValueType = "null" | "number" | "boolean" | "object" | "native-function" | "function" | "string";

export interface RuntimeVal {
  type: ValueType;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export function MK_NULL(n = null) {
  return { type: "null", value: n } as NullVal;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true) {
  return { type: "boolean", value: b } as BooleanVal;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}
export function MK_STRING(val: string) {
  return { type: "string", value: val } as StringVal;
}

export function MK_NUMBER(n = 0) {
  return { type: "number", value: n } as NumberVal;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}
export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface NativeFunctionValue extends RuntimeVal {
  type: "native-function";
  call: FunctionCall;
}

export function MK_NATIVE_FN(call: FunctionCall) {
  return { type: "native-function", call } as NativeFunctionValue;
}

export interface FunctionValue extends RuntimeVal {
  type: "function";
  name: string;
  parameters: string[];
  declarationEnv: Environment;
  body: Stmt[];
}

export class ReturnSignal {
  constructor(public value: RuntimeVal) {}
}

export interface NativeFunction {
  type: "native-function";
  call: (args: RuntimeVal[]) => RuntimeVal;
}