import { AssignmentExpr, BinaryExpr, Expr, Identifier, NumericLiteral, Program, Stmt, VarDeclaration } from "./ast.ts";
import { Token, tokenize, TokenType } from "./lexer.ts";


export default class Parser {
  private tokens: Token[] = [];
  
  // Checks if the program is at end of file (EOF)
  private not_eof (): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private eat() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: unknown) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parser Error:\n", err , prev, "Expecting: ", type);
      Deno.exit(1);
    }
    return prev;
  }

  public produceAST (sourceCode: string) {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse till end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt())
    }
    return program;
  }

  private parse_stmt(): Stmt {
    switch (this.at().type) {
      case TokenType.Let:

      case TokenType.Const:
        return this.parse_var_declaration();
      default:
        return this.parse_expr()
    }
  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(TokenType.Identifier, 
      "Expected Identifier name following si | tlga keywords"
    ).value;

    if (this.at().type == TokenType.Semicolon) {
      this.eat(); // expecting semicolons
      if (isConstant) {
        throw "Must assign value to 'tlga' expression. No value provided";
      }
      return { kind: "VarDeclaration", identifier, constant: false } as VarDeclaration;
    }
    this.expect(TokenType.Equals, "Expected equals token following identifier in variable declaration");
    const declaration = { kind: "VarDeclaration", value: this.parse_expr(), identifier, constant: isConstant } as VarDeclaration;

    this.expect(TokenType.Semicolon, "Variable declaration statements must end with semicolons");
    return declaration;
  }

  private parse_expr(): Expr {
    return this.parse_assignment_expr();
  }

  // Variable declaration has lowest precedance, hence it goes first
  private parse_assignment_expr(): Expr {
    const left = this.parse_additive_expr(); 
    if (this.at().type == TokenType.Equals) {
      this.eat(); // advance past equal token
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_additive_expr (): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }

  private parse_multiplicative_expr (): Expr {
    let left = this.parse_primary_expr();

    while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }

  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", symbol: this.eat().value } as Identifier;

      case TokenType.Number:
        return {
          kind: "NumericLiteral", 
          value: parseFloat(this.eat().value) 
        } as NumericLiteral;
        
      case TokenType.OpenParen: {
        this.eat(); // eat open paren
        const value = this.parse_expr();
        this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesis. Expected closing parenthesis ')'."); // closing parenthesis
        return value;
      }
      default:
        console.log("Unexpected token found during parsing", this.at());
        Deno.exit(1);
    }

  }
}