
const ESCAPES = { 'n': '\n', 'f': '\f', 'r': '\r', 't': '\t', 'v': '\v', '\'': '\'', '"': '"' }
const OPERATOR = {
  '+': true,
  '!': true,
  '-': true,
  '*': true,
  '/': true,
  '%': true,
  '=': true,
  '==': true,
  '!=': true,
  '===': true,
  '!==': true,
  '<': true,
  '>': true,
  '<=': true,
  '>=': true,
  '&&': true,
  '||': true,
  '|': true,
}
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
    } else if (this.is('[]{},:.()?;')) {
      this.tokens.push({ text: this.ch })
      this.index++
    } else if (this.isIdent(this.ch)) {
      this.readIdent()
    } else if (this.isWhitespace(this.ch)) {
      this.index++
    } else {
      let ch = this.ch
      let ch2 = this.ch + this.peek()
      let ch3 = this.ch + this.peek() + this.peek(2)
      let op = OPERATOR[ch]
      let op2 = OPERATOR[ch2]
      let op3 = OPERATOR[ch3]
      if (op || op2 || op3) {
        let token = op3 ? ch3 : (op2 ? ch2 : ch)
        this.tokens.push({text: token})
        this.index += token.length
      } else {
        throw 'Unexpected next char: ' + this.ch
      }
    }
  }
  return this.tokens
}

Lexer.prototype.is = function(chs) {
  return chs.indexOf(this.ch) >= 0
}

Lexer.prototype.peek = function(n) {
  n = n || 1
  return this.index + n < this.text.length ? this.text.charAt(this.index + n) : false
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
  let rawString = quote
  let escape = false
  while (this.index < this.text.length) {
    let ch = this.text.charAt(this.index)
    rawString += ch
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
        text: rawString,
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
AST.CallExpression = Symbol()
AST.AssignmentExpression = Symbol()
AST.UnaryExpression = Symbol()
AST.BinaryExpression = Symbol()
AST.LogicalExpression = Symbol()
AST.ConditionalExpression = Symbol()

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
  let body = []
  while (true) {
    if (this.tokens.length) {
      body.push(this.filter())
    }
    if (!this.expect(';')) {
      return { type: AST.Program, body: body }
    }
  }
  return { type: AST.Program, body: this.assignment() }
}

AST.prototype.primary = function() {

  let primary
  if (this.expect('(')) {
    primary = this.filter()
    this.consume(')')
  } else if (this.expect('[')) {
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
  let next
  while ((next = this.expect('.', '[', '('))) {

    if (next.text === '[') {
      primary = {
        type: AST.MemberExpression,
        object: primary,
        property: this.primary(),
        computed: true
      }
      this.consume(']')
    } else if (next.text === '.'){
      primary = {
        type: AST.MemberExpression,
        object: primary,
        property: this.identifier(),
        computed: false
      }
    } else if (next.text === '(') {
      primary = {
        type: AST.CallExpression,
        callee: primary,
        arguments: this.parseArguments()
      }
      this.consume(')')
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
      elements.push(this.assignment())
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
      property.value = this.assignment()
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
AST.prototype.expect = function(e1, e2, e3, e4) {
  let token = this.peek(e1, e2, e3, e4)
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
AST.prototype.peek = function(e1, e2, e3, e4) {

  if (this.tokens.length > 0) {
    let text = this.tokens[0].text
    if (text === e1 || text === e2 || text === e3 || text === e4 ||
      (!e1 && !e2 && !e3 && !e4)) {
      return this.tokens[0]
    }
  }
}

AST.prototype.parseArguments = function() {
  let args = []
  if (!this.peek(')')) {
    do {
      args.push(this.assignment())
    } while (this.expect(','))
  }
  return args
}

AST.prototype.assignment = function() {
  let left = this.ternary()
  if (this.expect('=')) {
    let right = this.ternary()
    return  { type: AST.AssignmentExpression, left: left, right: right }
  }
  return left
}

AST.prototype.unary = function() {
  let token
  if ((token = this.expect('+', '!', '-'))) {
    return {
      type: AST.UnaryExpression,
      operator: token.text,
      argument: this.unary()
    }
  } else {
    return this.primary()
  }
}

AST.prototype.multiplicative = function() {
  let left = this.unary()
  let token
  while ((token = this.expect('*', '/', '%'))) {
    left = {
      type: AST.BinaryExpression,
      left: left,
      operator: token.text,
      right: this.unary()
    }
  }
  return left
}

AST.prototype.additive = function() {
  let left = this.multiplicative()
  let token
  while ((token = this.expect('+')) || (token = this.expect('-'))) {
    left = {
      type: AST.BinaryExpression,
      left: left,
      operator: token.text,
      right: this.multiplicative()
    }
  }
  return left
}

AST.prototype.equality = function() {
  let left = this.relational()
  let token
  while ((token = this.expect('==', '!=', '===', '!=='))) {
    left = {
      type: AST.BinaryExpression,
      left: left,
      operator: token.text,
      right: this.relational()
    }
  }
  return left
}

AST.prototype.relational = function() {
  let left = this.additive()
  let token
  while ((token = this.expect('<', '<=', '>', '>='))) {
    left = {
      type: AST.BinaryExpression,
      left: left,
      operator: token.text,
      right: this.additive()
    }
  }
  return left
}

AST.prototype.logicalOR = function() {
  let left = this.logicalAND()
  let token
  while ((token = this.expect('||'))) {
    left = {
      type: AST.LogicalExpression,
      left: left,
      operator: token.text,
      right: this.logicalAND()
    }
  }
  return left
}

AST.prototype.logicalAND = function() {
  let left = this.equality()
  let token
  while ((token = this.expect('&&'))) {
    left = {
      type: AST.LogicalExpression,
      left: left,
      operator: token.text,
      right: this.equality()
    }
  }
  return left
}

AST.prototype.ternary = function() {
  let test = this.logicalOR()
  if (this.expect('?')) {
    let consequent = this.assignment()
    if (this.consume(':')) {
      let alternate = this.assignment()
      return {
        type: AST.ConditionalExpression,
        test: test,
        consequent: consequent,
        alternate: alternate
      }
    }
  }
  return test
}

AST.prototype.filter = function() {
  let left = this.assignment()
  while (this.expect('|')) {
    let args = [left]
    left = {
      type: AST.CallExpression,
      callee: this.identifier(),
      arguments: args,
      filter: true
    }
    while (this.expect(':')) {
      args.push(this.assignment())
    }
  }
  return left
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
  this.state = { body: [], nextId: 0, vars: [], filters: {} }
  this.recurse(ast)
  let fnString = this.filterPrefix() +
    'let fn=function(s,l){' +
    (this.state.vars.length ?
      'let ' + this.state.vars.join(',') + ';' : ''
    ) +
    this.state.body.join('') +
    '};return fn;'
  return new Function(
    'ensureSafeMemberName',
    'ensureSafeObject',
    'ensureSafeFunction',
    'ifDefined',
    'filter',
    fnString)(ensureSafeMemberName, ensureSafeObject, ensureSafeFunction, ifDefined, filter)
}

ASTCompiler.prototype.recurse = function(ast, context, create) {

  let intoId

  switch (ast.type) {
    case AST.Program:
      _.forEach(_.initial(ast.body), stmt => this.state.body.push(this.recurse(stmt), ';'))
      this.state.body.push('return ', this.recurse(_.last(ast.body)), ';')
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
      ensureSafeMemberName(ast.name)
      intoId = this.nextId()
      this.if_(
        this.getHasOwnProperty('l', ast.name),
        this.assign(intoId, this.nonComputedMember('l', ast.name))
      )
      if (create) {
        this.if_(
          this.not(this.getHasOwnProperty('l', ast.name)) +
          ' && s &&' +
          this.not(this.getHasOwnProperty('s', ast.name)),
          this.assign(this.nonComputedMember('s', ast.name), '{}')
        )
      }
      this.if_(
        this.not(this.getHasOwnProperty('l', ast.name)) + ' && s',
        this.assign(intoId, this.nonComputedMember('s', ast.name))
      )
      if (context) {
        context.context = this.getHasOwnProperty('l', ast.name) + '?l:s'
        context.name = ast.name
        context.computed = false
      }
      this.addEnsureSafeObject(intoId)
      return intoId

    case AST.ThisExpression:
      return 's'

    case AST.MemberExpression:
      intoId = this.nextId()
      let left = this.recurse(ast.object, undefined, create)
      if (context) {
        context.context = left
      }
      if (ast.computed) {
        let right = this.recurse(ast.property)
        this.addEnsureSafeMemberName(right)
        if (create) {
          this.if_(
            this.not(this.computedMember(left, right)),
            this.assign(this.computedMember(left, right), '{}')
          )
        }
        this.if_(left, this.assign(intoId,
          `ensureSafeObject(${this.computedMember(left, right)})`
        ))
        if (context) {
          context.name = right
          context.computed = true
        }
      } else {
        ensureSafeMemberName(ast.property.name)
        if (create) {
          this.if_(
            this.not(this.nonComputedMember(left, ast.property.name)),
            this.assign(this.nonComputedMember(left, ast.property.name), '{}')
          )
        }
        this.if_(left, this.assign(intoId,
          `ensureSafeObject(${this.nonComputedMember(left, ast.property.name)})`
        ))
        if (context) {
          context.name = ast.property.name
          context.computed = false
        }
      }
      return intoId

    case AST.CallExpression:
      let callContext, callee, args
      if (ast.filter) {
        callee = this.filter(ast.callee.name)
        args = _.map(ast.arguments,arg => this.recurse(arg))
        return `${callee}(${args})`
      } else {
        let callContext = {}
        let callee = this.recurse(ast.callee, callContext)
        let args = _.map(ast.arguments, arg => `ensureSafeObject(${this.recurse(arg)})`)
        if (callContext.name) {
          this.addEnsureSafeObject(callContext.context)
          if (callContext.computed) {
            callee = this.computedMember(callContext.context, callContext.name)
          } else {
            callee = this.nonComputedMember(callContext.context, callContext.name)
          }
        }
        this.addEnsureSafeFunction(callee)
        return `${callee}&&ensureSafeObject(${callee}(${args.join(',')}))`
      }
      break
    case AST.AssignmentExpression:
      let leftContext = {}
      this.recurse(ast.left, leftContext, true)
      let leftExpr
      if (leftContext.computed) {
        leftExpr = this.computedMember(leftContext.context, leftContext.name)
      } else {
        leftExpr = this.nonComputedMember(leftContext.context, leftContext.name)
      }
      return this.assign(leftExpr, `ensureSafeObject(${this.recurse(ast.right)})`)

    case AST.UnaryExpression:
      return ast.operator + `(${this.ifDefined(this.recurse(ast.argument), 0)})`

    case AST.BinaryExpression:
      if (ast.operator === '+' || ast.operator === '-') {
        return `(${this.ifDefined(this.recurse(ast.left), 0)})${ast.operator}(${this.ifDefined(this.recurse(ast.right), 0)})`
      } else {
        return `(${this.recurse(ast.left)})${ast.operator}(${this.recurse(ast.right)})`
      }
      break
    case AST.LogicalExpression:
      intoId = this.nextId()
      this.state.body.push(this.assign(intoId, this.recurse(ast.left)))
      this.if_(ast.operator === '&&' ? intoId : this.not(intoId), this.assign(intoId, this.recurse(ast.right)))
      return intoId
    case AST.ConditionalExpression:
      intoId = this.nextId()
      let testId = this.nextId()
      this.state.body.push(this.assign(testId, this.recurse(ast.test)))
      this.if_(testId, this.assign(intoId, this.recurse(ast.consequent)))
      this.if_(this.not(testId), this.assign(intoId, this.recurse(ast.alternate)))
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

ASTCompiler.prototype.nextId = function(skip) {
  let id = 'v' + (this.state.nextId++)
  if (!skip) {
    this.state.vars.push(id)
  }
  return id
}

ASTCompiler.prototype.computedMember = function(left, right) {
  return `(${left}[${right}])`
}

ASTCompiler.prototype.nonComputedMember = function(left, right) {
  return `(${left}).${right}`
}

ASTCompiler.prototype.if_ = function(test, consequent) {
  this.state.body.push('if(', test, '){', consequent, '}')
}

ASTCompiler.prototype.not = function(e) {
  return `!(${e})`
}

ASTCompiler.prototype.ifDefined = function(value, defaultValue) {
  return `ifDefined(${value}, ${this.escape(defaultValue)})`
}
ASTCompiler.prototype.getHasOwnProperty = function(obj, property) {
  return `${obj}&&(${this.escape(property)} in ${obj})`
}

ASTCompiler.prototype.addEnsureSafeMemberName = function(expr) {
  this.state.body.push(`ensureSafeMemberName(${expr});`)
}
ASTCompiler.prototype.addEnsureSafeObject = function(expr) {
  this.state.body.push(`ensureSafeObject(${expr});`)
}
ASTCompiler.prototype.addEnsureSafeFunction = function(expr) {
  this.state.body.push(`ensureSafeFunction(${expr});`)
}
ASTCompiler.prototype.filter = function(name) {
  if (!this.state.filters.hasOwnProperty('name')) {
    this.state.filters[name] = this.nextId(true)
  }
  return this.state.filters[name]
}
ASTCompiler.prototype.filterPrefix = function() {
  if (_.isEmpty(this.state.filters)) {
    return ''
  } else {
    let parts = _.map(this.state.filters, (varName, filterName) => {
      return `${varName}=filter(${this.escape(filterName)})`
    })
    return 'var ' + parts.join(',') + ';'
  }
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

function ensureSafeMemberName(name) {
  let banned = new Set([
    'constructor',
    '__proto__',
    '__defineSetter__',
    '__defineGetter__',
    '__lookupGetter__',
    '__lookupSetter__',
  ]);
  if (banned.has(name)) {
    throw 'Attempting to access a disallowed field'
  }
}

function ensureSafeObject(obj) {
  if (obj) {
    if (obj.document && obj.location && obj.alert && obj.setInterval) {
      throw 'Referencing window in expressions is not allowed'
    } else if (obj.children && (obj.nodeName || (obj.prop && obj.attr && obj.find))) {
      throw 'Referencing DOM in expressions is not allowed'
    } else if (obj.constructor === obj) {
      throw 'Referencing Function in expressions is not allowed'
    } else if (obj.getOwnPropertyName || obj.getOwnPropertyDescriptor) {
      throw 'Referencing Object in expressions is not allowed'
    }
  }
  return obj
}

const CALL = Function.prototype.call
const APPLY = Function.prototype.apply
const BIND = Function.prototype.bind
function ensureSafeFunction(obj) {
  if (obj) {
    if (obj.constructor === obj) {
      throw 'Referencing Function in expressions is not allowed'
    } else if (obj === CALL || obj === APPLY || obj === BIND) {
      throw 'Referencing call, apply, or bind in expressions is not allowed'
    }
  }
  return obj
}

function ifDefined(value, defaultValue) {
  return typeof value === 'undefined' ? defaultValue : value
}
