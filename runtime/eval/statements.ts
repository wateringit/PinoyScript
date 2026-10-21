import { ForStmt, FunctionDeclaration, IfStmt, Program, ReturnStmt, VarDeclaration, WhileStmt } from "../../frontend/ast.ts";
import Environment from '../environment.ts';
import { evaluate } from '../interpreter.ts';
import { BooleanVal, FunctionValue, MK_NULL, NumberVal, ReturnSignal, RuntimeVal, StringVal } from '../values.ts';

export function evaluate_program(program: Program, env: Environment): RuntimeVal {
  let lastEvaluated: RuntimeVal = MK_NULL();
  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, env);
  }
  return lastEvaluated;
}

export function evaluate_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
  const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL();
  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function evaluate_function_declaration(declaration: FunctionDeclaration, env: Environment): RuntimeVal {
  const fn = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  env.declareVar(declaration.name, fn, true);
  return fn;
}

export function evaluate_return_stmt(stmt: ReturnStmt, env: Environment): RuntimeVal {
  const value = stmt.value ? evaluate(stmt.value, env) : MK_NULL();
  throw new ReturnSignal(value);
}



export function evaluate_while_stmt(stmt: WhileStmt, env: Environment): RuntimeVal {
  while (is_truthy(evaluate(stmt.condition, env))) {
    const scope = new Environment(env); // fresh scope per iteration
    for (const s of stmt.body) evaluate(s, scope);
  }
  return MK_NULL();
}

export function evaluate_for_stmt(stmt: ForStmt, env: Environment): RuntimeVal {
  const loopEnv = new Environment(env); // holds the loop variable
  if (stmt.init) evaluate(stmt.init, loopEnv);

  while (!stmt.condition || is_truthy(evaluate(stmt.condition, loopEnv))) {
    const scope = new Environment(loopEnv); // fresh scope per iteration
    for (const s of stmt.body) evaluate(s, scope);
    if (stmt.update) evaluate(stmt.update, loopEnv);
  }
  return MK_NULL();
}

export function evaluate_if_statement(
  statement: IfStmt,
  env: Environment,
): RuntimeVal {
  // Evaluate the condition expression
  const condition = evaluate(statement.condition, env);

  // Check condition truthiness
  if (is_truthy(condition)) {
    let result: RuntimeVal = MK_NULL();
    for (const stmt of statement.body) {
      result = evaluate(stmt, env);
    }
    return result;
  } else if (statement.alternate) {
    let result: RuntimeVal = MK_NULL();
    for (const stmt of statement.alternate) {
      result = evaluate(stmt, env);
    }
    return result;
  }

  return MK_NULL();
}

// Truthness Checker lol
function is_truthy(val: RuntimeVal): boolean {
  switch (val.type) {
    case "boolean":
      return (val as BooleanVal).value;
    case "number":
      return (val as NumberVal).value !== 0;
    case "string":
      return (val as StringVal).value !== "";
    case "null":
      return false;
    default:
      return true;
  }
}