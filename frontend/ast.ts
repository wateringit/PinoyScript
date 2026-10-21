export type NodeType = 
  // Statements
  | "Program" 
  | "VarDeclaration"
  | "FunctionDeclaration"
  | "ReturnStmt"
  | "WhileStmt"
  | "IfStmt"
  | "ForStmt"
  | "BreakStmt"
  | "ContinueStmt"
  // Expressions
  | "AssignmentExpr"
  | "MemberExpr"
  | "AugmentedAssignmentExpr"
  | "CallExpr"
  // Literals
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "StringLiteral" 
  | "Identifier" 
  | "BinaryExpr";


// AST defnitions
export interface Stmt { 
  kind: NodeType;
}

export interface Program extends Stmt { 
  kind: "Program";
  body: Stmt[];
}

export interface VarDeclaration extends Stmt { 
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface FunctionDeclaration extends Stmt {
  kind: "FunctionDeclaration";
  parameters: string[];
  name: string;
  body: Stmt[];
}

export interface ReturnStmt extends Stmt {
  kind: "ReturnStmt";
  value?: Expr; // Optional because someone can just write plain "balik"
}

export interface WhileStmt extends Stmt {
  kind: "WhileStmt";
  condition: Expr;
  body: Stmt[];
}

export interface ForStmt extends Stmt {
  kind: "ForStmt";
  init?: Stmt;
  condition?: Expr;
  update?: Expr;
  body: Stmt[];
}

export interface IfStmt extends Stmt {
  kind: "IfStmt";
  condition: Expr;
  body: Stmt[];
  alternate?: Stmt[]; 
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface AugmentedAssignmentExpr extends Expr {
  kind: "AugmentedAssignmentExpr";
  assigne: Expr;
  operator: string;
  value: Expr;
}

export interface BreakStmt extends Stmt {
  kind: "BreakStmt";
} 

export interface ContinueStmt extends Stmt {
  kind: "ContinueStmt";
}