import { AssignmentExpr, BinaryExpr, CallExpr, Expr, Identifier, MemberExpr, NumericLiteral, ObjectLiteral, Program, Property, Stmt, VarDeclaration } from "./ast.ts";
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
    const left = this.parse_object_expr(); 
    if (this.at().type == TokenType.Equals) {
      this.eat(); // advance past equal token
      const value = this.parse_assignment_expr();
      return { value, assigne: left, kind: "AssignmentExpr" } as AssignmentExpr;
    }

    return left;
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace) {
      return this.parse_additive_expr();
    }

    this.eat();
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type != TokenType.CloseBrace) {
      const key = this.expect(TokenType.Identifier, "Object literal key expected").value;
      // Allows shorthand key: pair to key,
      if (this.at().type == TokenType.Comma) {
        this.eat(); // go past the comma
        properties.push({ key, kind: "Property" } as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ key, kind: "Property" });
        continue;
      }
      // { key: value }
      this.expect(TokenType.Colon, "Missing colon follwing identifier in Object Expression");
      const value = this.parse_expr();

      properties.push({ kind: "Property", value, key });
      if (this.at().type != TokenType.CloseBrace) {
        this.expect(TokenType.Comma, "Expected Comma or closing brace following Property");
      }
    }

    this.expect(TokenType.CloseBrace, "Object missing closing brace");
    return { kind: "ObjectLiteral", properties } as ObjectLiteral;
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
    let left = this.parse_exponential_expr();

    while (this.at().value == "*" || this.at().value == "/" || this.at().value == "%") {
      const operator = this.eat().value;
      const right = this.parse_exponential_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }
  private parse_exponential_expr (): Expr {
    let left = this.parse_call_member_expr();

    while (this.at().value == "**") {
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left; 
  }

  private parse_call_member_expr(): Expr {
    const member = this.parse_member_expr();

    if (this.at().type == TokenType.OpenParen) {
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr(caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args(): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    const args = this.at().type == TokenType.CloseParen ? [] : this.parse_arguments_list();

    this.expect(TokenType.CloseParen, "Expected closing parenthesis");
    return args;
  }

  private parse_arguments_list(): Expr[] {
    const args = [this.parse_assignment_expr()];

    while (this.at().type == TokenType.Comma && this.eat()) {
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  private parse_member_expr(): Expr {
  let object = this.parse_primary_expr();

    while (this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket) {
      const operator = this.eat();
      let property: Expr;
      let computed: boolean;

      if (operator.type == TokenType.Dot) {
        // Non-computed values (obj.expr)
        computed = false;
        property = this.parse_primary_expr();

        if (property.kind != "Identifier") {
          throw `Cannot use dot operator without right hand side being an identifier`;
        }
      } else {
        // This allows obj[value_computed]
        computed = true;
        property = this.parse_expr();
        this.expect(TokenType.CloseBracket, "Missing closing bracket in computed value");
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }

    return object;
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