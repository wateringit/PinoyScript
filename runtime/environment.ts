import { BooleanVal, MK_BOOL, MK_NATIVE_FN, MK_NULL, MK_NUMBER, NativeFunction, NumberVal, RuntimeVal, StringVal } from './values.ts';
// Output as a string
// deno-lint-ignore no-explicit-any
function stringification(val: any): string {
    if (!val) return "null";
    if (val.type === "number") return String(val.value);
    if (val.type === "string") return val.value;
    if (val.type === "boolean") return String(val.value);
    if (val.type === "null") return "null";
    return "[Object]";
  }
export function createGlobalEnv() {
  const env = new Environment;
  // Setup global environment
  env.declareVar("tama", MK_BOOL(true), true);
  env.declareVar("mali", MK_BOOL(false), false);
  env.declareVar("wala", MK_NULL(), true);

  // Define a native built-in method
  env.declareVar("sabiln", MK_NATIVE_FN((args) => {
    const encoder = new TextEncoder();
    const output = args.map(arg => stringification(arg)).join(" ");
    Deno.stdout.writeSync(encoder.encode(output + "\n"));
    return MK_NULL();
  }), true);

  // Pure print (no newline)
  env.declareVar("sabi", MK_NATIVE_FN((args) => {
    const encoder = new TextEncoder();
    const output = args.map(arg => stringification(arg)).join(" ");
    Deno.stdout.writeSync(encoder.encode(output));
    return MK_NULL();
  }), true);

  function timeFunction(_args: RuntimeVal[], _env: Environment) {
    return MK_NUMBER(Date.now());
  }
  env.declareVar("oras", MK_NATIVE_FN(timeFunction), true);
  function max(_args: RuntimeVal[], _env: Environment) {
    const numbers = _args.map(arg => {
        if (arg.type !== "number") {
            throw new Error(`The pinakamalaki() function expects arguments of type number, got: ${arg.type}`);
        }
        return (arg as NumberVal).value; 
    });
    if (numbers.length === 0) {
        return MK_NUMBER(-Infinity);
    }
    const result = Math.max(...numbers);
    return MK_NUMBER(result);
  }
  env.declareVar("pinakamalaki", MK_NATIVE_FN(max), true);

  const inputFunc: NativeFunction = {
    type: "native-function",
    call: (args: RuntimeVal[]) => {
      let promptText = "";

      // 1. Handle the custom prompt argument
      if (args.length > 0) {
        const firstArg = args[0];

        if (firstArg.type === "string") {
          // User passed: input("Enter your name: ")
          promptText = (firstArg as StringVal).value;
        } else if (firstArg.type === "number") {
          // User passed: input(123)
          promptText = String((firstArg as NumberVal).value);
        } else {
          promptText = "";
        }
      } else {
        promptText = "";
      }
      const response = prompt(promptText);
      return {
        type: "string",
        value: response || ""
      };
    }
  };

  env.declareVar("pasok", inputFunc, true);

  const toNumberFunc: NativeFunction = {
    type: "native-function",
    call: (args: RuntimeVal[]) => {
      const val = args[0];
      if (val && val.type === "string") {
        const parsed = parseFloat((val as StringVal).value);
        return { type: "number", value: isNaN(parsed) ? 0 : parsed };
      }
      return { type: "number", value: 0 };
    }
  };
  
  env.declareVar("bilang", toNumberFunc, true); // 'numero' = number
  const toStrFunc: NativeFunction = {
    type: "native-function",
    call: (args: RuntimeVal[]) => {
      const val = args[0];
      if (!val) return { type: "string", value: "" };

      switch (val.type) {
        case "string":
          return val as StringVal;
        case "number":
          return { type: "string", value: String((val as NumberVal).value) };
        case "boolean":
          return { type: "string", value: String((val as BooleanVal).value) };
        default:
          return { type: "string", value: "[Object]" };
      }
    }
  };

  env.declareVar("teksto", toStrFunc, true); // 'teksto' = text/string
  return env;

}
export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeVal>;
  private constants: Set<string>;

  constructor(parentENV?: Environment) {
    const _global = parentENV ? true : false;
    this.parent = parentENV;
    this.variables = new Map();
    this.constants = new Set();
  }

  public declareVar(varname: string, value: RuntimeVal, constant: boolean): RuntimeVal {
    if (this.variables.has(varname)) {
    throw `Cannot declare variable ${varname}. As it is already defined.`;  
    }
    this.variables.set(varname, value);

    if (constant) {
      this.constants.add(varname);
    }
    return value;
  }

  public assignVar(varname: string, value: RuntimeVal): RuntimeVal {
    const env = this.resolve(varname);
    // Cannot assign variables to constants
    if (env.constants.has(varname)) {
      throw `Cannot reassign to variable ${varname} as it was declared constant.`;
    }
    env.variables.set(varname, value);
    return value;
  }

  public lookupVar(varname: string): RuntimeVal {
    const env = this.resolve(varname);
    return env.variables.get(varname) as RuntimeVal;
  }

  public resolve(varname: string): Environment {
    if (this.variables.has(varname)) {
      return this;
    }
    if (this.parent == undefined) {
      throw `Cannot resolve '${varname}' as it does not exist.`;
    }
    return this.parent.resolve(varname);
  }
}