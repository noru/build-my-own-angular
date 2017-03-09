
const ESCAPES = { 'n': '\n', 'f': '\f', 'r': '\r', 't': '\t', 'v': '\v', '\'': '\'', '"': '"' }

/*
  Lexer
 */
function Lexer() {

}

Lexer.prototype.lex = function(text) {

  this.text = text
  this.index = 0
  this.ch = undefined
  this.tokens = []

  while (this.index < this.text.length) {
    this.ch = this.text.charAt(this.index)
    if (this.isNumber(this.ch) ||
      (this.is('.') && this.isNumber(this.peek()))) {
      this.readNumber()
    } else if (this.is('\'"')) {
      this.readString(this.ch)
    } else if (this.is('[]{},:.')) {
      this.tokens.push({ text: this.ch })
      this.index++
    } else if (this.isIdent(this.ch)) {
      this.readIdent()
    } else if (this.isWhitespace(this.ch)) {
      this.index++
    } else {
      throw 'Unexpected next char: ' + this.ch
    }
  }
  return this.tokens
}

Lexer.prototype.is = function(chs) {
  return chs.indexOf(this.ch) >= 0
}

Lexer.prototype.peek = function() {
  return this.index < this.text.length - 1 ? this.text.charAt(this.index + 1) : false
}

Lexer.prototype.isNumber = function(ch) {
  return '0' <= ch && ch <= '9'
}

Lexer.prototype.readNumber = function() {

  let number = ''
  while (this.index < this.text.length) {
    let ch = this.text.charAt(this.index).toLowerCase()
    if (this.isNumber(ch) || ch === '.') {
      number += ch
    } else {
      let nextCh = this.peek()
      let prevCh = number.charAt(number.length - 1)
      if (ch === 'e' && this.isExpOperator(nextCh)) {
        number += ch
      } else if (this.isExpOperator(ch) && prevCh === 'e' && nextCh && this.isNumber(nextCh)) {
        number += ch
      } else if (this.isExpOperator(ch) && prevCh === 'e' && (!nextCh || !this.isNumber(nextCh))) {
        throw 'Invalid exponent'
      } else {
        break
      }
    }
    this.index++
  }
  return this.tokens.push({
    text: number,
    value: Number(number)
  })
}

Lexer.prototype.readString = function(quote) {

  this.index++
  let string = ''
  let escape = false
  while (this.index < this.text.length) {
    let ch = this.text.charAt(this.index)
    if (escape) {
      if (ch === 'u') {
        let hex = this.text.substring(this.index + 1, this.index + 5)
        if (!hex.match(/[\da-f]{4}/i)) {
          throw 'Invalid unicode escape'
        }
        this.index += 4
        string += String.fromCharCode(parseInt(hex, 16))
      } else {
        let replacement = ESCAPES[ch]
        if (replacement) {
          string += replacement
        } else {
          string += ch
        }
      }
      escape = false
    } else if (ch === quote) {
      this.index++
      this.tokens.push({
        text: string,
        value: string
      })
      return
    } else if (ch === '\\') {
      escape = true
    } else {
      string += ch
    }
    this.index++
  }
  throw 'Unmatched quote'
}

Lexer.prototype.readIdent = function() {
  let text = ''
  while (this.index < this.text.length) {
    let ch = this.text.charAt(this.index)
    if (this.isIdent(ch) || this.isNumber(ch)) {
      text += ch
    } else {
      break
    }
    this.index++
  }
  let token = {
    text: text,
    identifier: true
  }
  this.tokens.push(token)
}
Lexer.prototype.isExpOperator = function(ch) {
  return ch === '-' || ch === '+' || this.isNumber(ch)
}
Lexer.prototype.isIdent = function(ch) {
  return (ch >= 'a' && ch <= 'z') ||
         (ch >= 'A' && ch <= 'Z') ||
         ch === '_' ||
         ch === '$'
}
Lexer.prototype.isWhitespace = function(ch) {
  return ch === ' ' || ch === '\r' || ch === '\t' ||
         ch === '\n' || ch === '\v' || ch ===  '\u00A0'
}
/*
  AST
 */
function AST(lexer) {
  this.lexer = lexer
}
AST.Program = Symbol()
AST.Literal = Symbol()
AST.ArrayExpression = Symbol()
AST.ObjectExpression = Symbol()
AST.property = Symbol()
AST.Identifier = Symbol()
AST.ThisExpression = Symbol()
AST.MemberExpression = Symbol()

AST.prototype.constants = {
  'null': { type: AST.Literal, value: null },
  'true': { type: AST.Literal, value: true },
  'false': { type: AST.Literal, value: false },
  'this': { type: AST.ThisExpression }
}

AST.prototype.ast = function(text) {
  this.tokens = this.lexer.lex(text)
  // AST building...
  return this.program()
}

AST.prototype.program = function() {
  return { type: AST.Program, body: this.primary() }
}

AST.prototype.primary = function() {

  let primary
  if (this.expect('[')) {
    primary = this.arrayDeclaration()
  } else if (this.expect('{')) {
    primary = this.object()
  } else if (this.constants.hasOwnProperty(this.tokens[0].text)) {
    primary = this.constants[this.consume().text]
  } else if (this.peek().identifier) {
    primary = this.identifier()
  } else {
    primary = this.constant()
  }

  if (this.expect('.')) {
    primary = {
      type: AST.MemberExpression,
      object: primary,
      property: this.identifier()
    }
  }
  return primary
}

AST.prototype.arrayDeclaration = function() {

  let elements = []
  if (!this.peek(']')) {
    do {
      if (this.peek(']')) {
        break
      }
      elements.push(this.primary())
    } while (this.expect(','))
  }
  this.consume(']')
  return { type: AST.ArrayExpression, elements: elements }
}
AST.prototype.object = function() {
  let properties = []
  if (!this.peek('}')) {
    do {
      let property = { type: AST.property }
      if (this.peek().identifier) {
        property.key = this.identifier()
      } else {
        property.key = this.constant()
      }
      this.consume(':')
      property.value = this.primary()
      properties.push(property)
    } while (this.expect(','))
  }
  this.consume('}')
  return { type: AST.ObjectExpression, properties: properties }
}
AST.prototype.constant = function() {
  return { type: AST.Literal, value: this.consume().value }
}
AST.prototype.identifier = function() {
  return { type: AST.Identifier, name: this.consume().text }
}
AST.prototype.expect = function(e) {
  let token = this.peek(e)
  if (token) {
    return this.tokens.shift()
  }
}
AST.prototype.consume = function(e) {
  let token = this.expect(e)
  if (!token) {
    throw 'Unexpected. Expecting: ' + e
  }
  return token
}
AST.prototype.peek = function(e) {

  if (this.tokens.length > 0) {
    let text = this.tokens[0].text
    if (text === e || !e) {
      return this.tokens[0]
    }
  }
}
/*
  AST compiler
 */
function ASTCompiler(astBuilder) {
  this.astBuilder = astBuilder
}

ASTCompiler.prototype.stringEscapeRegex = /[^ a-zA-Z0-9]/g

ASTCompiler.prototype.stringEscapeFn = function(c) {
  return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
}

ASTCompiler.prototype.compile = function(text) {

  let ast = this.astBuilder.ast(text)
  this.state = { body: [], nextId: 0, vars: [] }
  this.recurse(ast)
  let vars = this.state.vars.length ? `var ${this.state.vars.join(',')};` : ''
  return new Function('s', vars + this.state.body.join(''))
}

ASTCompiler.prototype.recurse = function(ast) {

  let intoId

  switch (ast.type) {
    case AST.Program:
      this.state.body.push('return ', this.recurse(ast.body), ';')
      break
    case AST.Literal:
      return this.escape(ast.value)
    case AST.ArrayExpression:
      let elements = _.map(ast.elements, e => this.recurse(e), this)
      return `[${elements.join(',')}]`
    case AST.ObjectExpression:
      let properties = _.map(ast.properties, p => {
        let key = p.key.type === AST.Identifier ? p.key.name : this.escape(p.key.value)
        let value = this.recurse(p.value)
        return key + ':' + value
      })
      return `{${properties.join(',')}}`
    case AST.Identifier:
      intoId = this.nextId()
      this.if_('s', this.assign(intoId, this.nonComputedMember('s', ast.name)))
      return intoId
    case AST.ThisExpression:
      return 's'
    case AST.MemberExpression:
      intoId = this.nextId()
      let left = this.recurse(ast.object)
      this.if_(left, this.assign(intoId, this.nonComputedMember(left, ast.property.name)))
      return intoId
  }
}

ASTCompiler.prototype.escape = function(value) {
  if (_.isString(value)) {
    return `'${value.replace(this.stringEscapeRegex, this.stringEscapeFn)}'`
  } else if (_.isNull(value)) {
    return 'null'
  } else {
    return value
  }
}

ASTCompiler.prototype.assign = function(id, value) {
  return id + '=' + value + ';'
}

ASTCompiler.prototype.nextId = function() {
  console.log(this.state.nextId);
  let id = 'v' + (this.state.nextId++)
  this.state.vars.push(id)
  return id
}

ASTCompiler.prototype.nonComputedMember = function(left, right) {
  return `(${left}).${right}`
}

ASTCompiler.prototype.if_ = function(test, consequent) {
  this.state.body.push('if(', test, '){', consequent, '}')
}
/*
 Parser
 */
function Parser(lexer) {
  this.lexer = lexer
  this.ast = new AST(this.lexer)
  this.astCompiler = new ASTCompiler(this.ast)
}

Parser.prototype.parse = function(text) {
  return this.astCompiler.compile(text)
}

function parse(expr) {
  let lexer = new Lexer
  let parser = new Parser(lexer)
  return parser.parse(expr)
}
