import { AssignmentExpr, AugmentedAssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral, StringLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { FunctionValue, MK_NULL, MK_NUMBER, MK_STRING, NativeFunctionValue, NumberVal, ObjectVal, ReturnSignal, RuntimeVal, StringVal } from "../values.ts";

export function evaluate_numeric_binary_expr(
  lhs: RuntimeVal,
  rhs: RuntimeVal,
  operator: string,
): RuntimeVal {
  // Handle string concatenation if either side is a string value
  if (operator === "+") {
    if (lhs.type === "string" || rhs.type === "string") {
      const leftVal = lhs.type === "string" ? (lhs as StringVal).value : String((lhs as NumberVal).value);
      const rightVal = rhs.type === "string" ? (rhs as StringVal).value : String((rhs as NumberVal).value);
      return MK_STRING(leftVal + rightVal);
    }
  }

  // Ensure they are treated as numbers for math operations below
  const numLhs = (lhs as NumberVal).value;
  const numRhs = (rhs as NumberVal).value;
  let result: number;

  if (operator == "+") {
    result = numLhs + numRhs;
  } else if (operator == "-") {
    result = numLhs - numRhs;
  } else if (operator == "*") {
    result = numLhs * numRhs;
  } else if (operator == "/") {
    result = numLhs / numRhs;
  } else if (operator == "//") {
    result = Math.floor(numLhs / numRhs);
  } else if (operator == "**") {
    result = numLhs ** numRhs;
  } else if (operator == "%") {
    result = numLhs % numRhs;
  } else {
    throw `Runtime Error: Unknown operator '${operator}' inside evaluate_numeric_binary_expr`;
  }

  return MK_NUMBER(result);
}

export function evaluate_string_expr(node: StringLiteral, _env: Environment): StringVal {
  return {
    value: node.value,
    type: "string",
  } as StringVal;
}

export function evaluate_binary_expr(
  binop: BinaryExpr,
  env: Environment,
): RuntimeVal {
  // Handle arithmetic & exponential operations
  if (["+", "-", "*", "/", "%", "**", "//"].includes(binop.operator)) {
    const left = evaluate(binop.left, env);
    const right = evaluate(binop.right, env);
    if (left.type === "number" && right.type === "number" || (binop.operator === "+" && (left.type === "string" || right.type === "string"))) {
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

export function evaluate_assignments(node: AssignmentExpr | AugmentedAssignmentExpr, env: Environment): RuntimeVal {
  if (node.assigne.kind !== "Identifier") {
    throw `Invalid Left-Hand Side inside assignment expression ${JSON.stringify(node.assigne)}`;
  }
  const varname = (node.assigne as Identifier).symbol;

  if (node.kind === "AugmentedAssignmentExpr") {
    const currentValue = env.lookupVar(varname);
    const rightValue = evaluate(node.value, env);

    if (currentValue.type !== "number" || rightValue.type !== "number") {
      throw `Runtime Error: Augmented assignment requires numeric operands, got '${currentValue.type}' and '${rightValue.type}'`;
    }

    const leftNum = (currentValue as NumberVal).value;
    const rightNum = (rightValue as NumberVal).value;
    let result: number;

    switch (node.operator) {
      case "+=": result = leftNum + rightNum; break;
      case "-=": result = leftNum - rightNum; break;
      case "*=": result = leftNum * rightNum; break;
      case "/=": result = leftNum / rightNum; break;
      case "%=": result = leftNum % rightNum; break;
      default: throw `Runtime Error: Unknown augmented operator '${node.operator}'`;
    }

    return env.assignVar(varname, MK_NUMBER(result));
  }

  return env.assignVar(varname, evaluate(node.value, env));
}

export function evaluate_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
  const object = { type: "object", properties: new Map() } as ObjectVal;
  for (const { key,value } of obj.properties ) {

    const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env);
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
