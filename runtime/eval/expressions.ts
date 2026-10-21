import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { MK_NULL, NativeFunctionValue, NumberVal, ObjectVal, RuntimeVal } from "../values.ts";

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

export function evaluate_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {

  const lhs = evaluate(binop.left, env);
  const rhs = evaluate(binop.right, env);

  if (lhs.type == "number" && rhs.type == "number") {
    return evaluate_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
  }
  // One or both values are Null
  return MK_NULL();
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

  if (func.type !== "native-function") {
    throw "Cannot call value that is not a function: " + JSON.stringify(func);
  }

  const result = (func as NativeFunctionValue).call(args, env);
  return result;
}