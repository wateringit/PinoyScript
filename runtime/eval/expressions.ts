import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue, MK_NULL, NativeFunctionValue, NumberVal, ObjectVal, ReturnSignal, RuntimeVal } from "../values.ts";

export function evaluate_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string,): NumberVal {
  let result: number;
  if (operator == "+") {
    result = lhs.value + rhs.value;
  } else if (operator == "-") {
    result = lhs.value - rhs.value;
  } else if (operator == "*") {
    result = lhs.value * rhs.value;
  } else if (operator == "/") {
    // TODO: Division by zero checks
    result = lhs.value / rhs.value;
  } else if (operator == "**") {
    result = lhs.value ** rhs.value;
  } else if (operator == "%") {
    result = lhs.value % rhs.value;
  } else {
    throw `Runtime Error: Unknown operator '${operator}' inside evaluate_numeric_binary_expr`;
  }

  return { value: result, type: "number" };
}

export function evaluate_binary_expr(
  binop: BinaryExpr,
  env: Environment,
): RuntimeVal {
  // Handle arithmetic & exponential operations
  if (["+", "-", "*", "/", "%", "**"].includes(binop.operator)) {
    const left = evaluate(binop.left, env);
    const right = evaluate(binop.right, env);
    if (left.type === "number" && right.type === "number") {
      return evaluate_numeric_binary_expr(left as NumberVal, right as NumberVal, binop.operator);
    }
    throw `Runtime Error: Arithmetic operations require numeric operands, got '${left.type}' and '${right.type}'`;
  }

  // Handle comparison operators returning booleans
  if (["<", ">", "<=", ">=", "==", "!="].includes(binop.operator)) {
    const left = evaluate(binop.left, env);
    const right = evaluate(binop.right, env);
    return evaluate_comparison_expr(left, right, binop.operator);
  }

  throw `Runtime Error: Unknown operator '${binop.operator}'`;
}

function evaluate_comparison_expr(
  left: RuntimeVal,
  right: RuntimeVal,
  operator: string,
): RuntimeVal {
  // Cast to any or your specific NumberVal interface to satisfy TypeScript
  const l = (left as unknown as { value: number }).value;
  const r = (right as unknown as { value: number }).value;
  let result = false;

  switch (operator) {
    case "<": result = l < r; break;
    case ">": result = l > r; break;
    case "<=": result = l <= r; break;
    case ">=": result = l >= r; break;
    case "==": result = l === r; break;
    case "!=": result = l !== r; break;
  }

  return { type: "boolean", value: result } as RuntimeVal;
}


export function evaluate_identifier(identifier: Identifier, env: Environment): RuntimeVal {
  const val = env.lookupVar(identifier.symbol);
  return val;
}

export function evaluate_assignments(node: AssignmentExpr, env: Environment): RuntimeVal {
  if (node.assigne.kind !== "Identifier") {
    throw `Invalid Left-Hand Side inside assignment expression ${JSON.stringify(node.assigne)}`;
  }
  const varname = (node.assigne as Identifier).symbol;
  return env.assignVar(varname, evaluate(node.value, env));
}

export function evaluate_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key,value } of obj.properties ) {

    const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env);
    // Handles valid key: pair
    
    object.properties.set(key, runtimeVal);
  }
  return object;
}

export function evaluate_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
  const args = expr.args.map((arg) => evaluate(arg, env));
  const func = evaluate(expr.caller, env);

  if (func.type == "native-function") {
    const result = (func as NativeFunctionValue).call(args, env);
    return result;
  }
  
  if (func.type == "function") {
    const fn = func as FunctionValue;
    const scope = new Environment(fn.declarationEnv);
    for (let i = 0; i < fn.parameters.length; ++i) {
      // TODO Check the bounds 
      // verify arity of function
      const varname = fn.parameters[i];
      scope.declareVar(varname, args[i], false);
    }
      try {
        for (const stmt of fn.body) {
          evaluate(stmt, scope);
      }
      } catch (e) {
        if (e instanceof ReturnSignal) return e.value;
        throw e;
      }
      return MK_NULL();
    } 
    throw "Cannot call value that is not a function: " + JSON.stringify(func);
  }