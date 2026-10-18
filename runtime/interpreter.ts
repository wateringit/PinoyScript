import { RuntimeVal, NullVal, NumberVal } from "./values.ts";
import { NumericLiteral, Stmt, BinaryExpr } from "../frontend/ast.ts";

function evaluate_program (program: Program): RuntimeVal {
  let lastEvaluated: RuntimeVal = { type: "null", value: "null" } as NullVal;
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement);
  }
  return lastEvaluated;
}

function evaluate_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string,): NumberVal {
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
  } else {
    result = lhs.value % rhs.value;
  }

  return { value: result, type: "number" };
}
function evaluate_binary_expr (binop: BinaryExpr): RuntimeVal {

  const lhs = evaluate(binop.left);
  const rhs = evaluate(binop.right);

  if (lhs.type == "number" && rhs.type == "number") {
    return evaluate_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
  }
  // One or both values are Null
  return { type: "null", value: "null" } as NullVal;
}

export function evaluate (astNode: Stmt): RuntimeVal {
  switch (astNode.kind) {
    case "NumericLiteral":
      return {
        value: ((astNode as NumericLiteral).value), 
        type: "number", 
      } as NumberVal;
    case "NullLiteral":
      return { value: "null", type: "null" } as NullVal;
    case "BinaryExpr":
      return evaluate_binary_expr(astNode as BinaryExpr);
    case "Program":
      return evaluate_program(astNode as Program);
    default:
      console.error("Unrecognized AST Node" , astNode);
      Deno.exit(0);
  }
}