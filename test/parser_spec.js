describe('parser', function() {

  it('can parse an integer', function() {

    let fn = parse('32')
    expect(fn).toBeDefined()
    expect(fn()).toBe(32)
  })

  it('can parse a float number', function() {

    let fn = parse('4.2')
    expect(fn()).toBe(4.2)

    fn = parse('.42')
    expect(fn()).toBe(.42)
  })

  it('can parse a number in scientific notation', function() {

    let fn = parse('11e12')
    expect(fn()).toBe(11000000000000)

    fn = parse('11e+12')
    expect(fn()).toBe(11000000000000)

    fn = parse('11E12')
    expect(fn()).toBe(11000000000000)

    fn = parse('.11e12')
    expect(fn()).toBe(110000000000)

    fn = parse('11e-2')
    expect(fn()).toBe(.11)
  })

  it('will not parse invalid scientific notations', function() {

    expect(function() { parse('42e-') }).toThrow()
    expect(function() { parse('42e-a') }).toThrow()
  })

  it('can parse a string in single quotes', function() {
    let fn = parse("'abc'")
    expect(fn()).toEqual('abc')
  })

  it('can parse a string in double quotes', function() {
    let fn = parse('"abc"')
    expect(fn()).toEqual('abc')
  })

  it('will not parse a string with mismatching quotes', function() {
    expect(function() { parse('"abc\'') }).toThrow()
  })

  it('can parse a string with single quotes inside', function() {

    let fn = parse("'a\\\'b'")
    expect(fn()).toEqual('a\'b')
  })

  it('can parse a string with double quotes inside', function() {

    let fn = parse('"a\\\"b"')
    expect(fn()).toEqual('a\"b')
  })

  it('will parse a string with unicode escapes', function() {

    let fn = parse('"\\u00A0"')
    expect(fn()).toEqual('\u00A0')
  })

  it('will not parse a string with invald unicode escapes', function() {
    expect(function() { parse('"\\u00T0"') }).toThrow()
  })

  it("will parse null", function() {
    let fn = parse('null')
    expect(fn()).toBe(null)
  })

  it("will parse true", function() {
    let fn = parse('true')
    expect(fn()).toBe(true)
  })

  it("will parse false", function() {
    let fn = parse('false')
    expect(fn()).toBe(false)
  })

  it('ignores whitespace', function() {
    let fn = parse(' \n42 ')
    expect(fn()).toEqual(42)
  })

  it('will parse an empty array', function() {
    let fn = parse('[]')
    expect(fn()).toEqual([])
  })

  it('will parse a non-empty array', function() {
    let fn = parse('[1, "tow", [3], true]')
    expect(fn()).toEqual([1, "tow", [3], true])
  })

  it('will parse an array with trailing commas', function() {
    let fn = parse('[1, 2, 3,]')
    expect(fn()).toEqual([1, 2, 3])
  })

  it('will parse an empty object', function() {
    let fn = parse('{}')
    expect(fn()).toEqual({})
  })

  it('will parse a non-empty object', function() {
    let fn = parse('{ "a key": 1, \'another-key\': 2 }')
    expect(fn()).toEqual({'a key': 1, 'another-key': 2 })
  })

  it('will parse an object with identifier keys', function() {
    let fn = parse('{a:1, b:[2,3], c: { d:4 }}')
    expect(fn()).toEqual({a:1, b:[2,3], c: { d:4 }})
  })

  it('looks up an attribute from the scope', function() {
    let fn = parse('aKey')
    expect(fn({ aKey: 12 })).toBe(12)
    expect(fn({})).toBeUndefined()
  })

  it('returns undefined when looking up attribute from undefined', function() {
    let fn = parse('aKey')
    expect(fn()).toBeUndefined()
  })

  it('will parse "this"', function() {
    let fn = parse('this')
    let scope = {}
    expect(fn(scope)).toBe(scope)
    expect(fn()).toBeUndefined()
  })

  it ('looks up a 2-part identifier path from the scope', function() {

    let fn = parse('aKey.anotherKey')
    expect(fn({aKey: { anotherKey: 42}})).toBe(42)
    expect(fn({aKey: {}})).toBeUndefined()
    expect(fn({})).toBeUndefined()
  })

  it ('looks up a member from an object', function() {
    let fn = parse('{ aKey: 42 }.aKey')
    expect(fn()).toBe(42)
  })

  it ('uses locals instead of scope when there is a matching key', function() {
    let fn = parse('aKey')
    let scope = { aKey: 11 }
    let locals = { aKey: 12 }
    expect(fn(scope, locals)).toBe(12)
  })

  it ('does not use locals instead of scope when no matching key', function() {
    let fn = parse('aKey')
    let scope = { aKey: 11 }
    let locals = { anotherKey: 12 }
    expect(fn(scope, locals)).toBe(11)
  })

  it('uses locals instead of scope when the first part matches', function() {

    let fn = parse('aKey.anotherKey')
    let scope = { aKey: { anotherKey: 42 } }
    let locals = { aKey: {} }
    expect(fn(scope, locals)).toBeUndefined()
  })

  it('parses a simple computed property access', function() {
    let fn = parse('aKey["anotherKey"]')
    expect(fn({aKey: {anotherKey: 12}})).toBe(12)
  })

  it('parses a computed numeric array access', function() {
    let fn = parse('arr[1]')
    expect(fn({ arr: [1, 2, 3]})).toBe(2)
  })

  it('parses a computed access with another key as property', function() {
    let fn = parse('lock[key]')
    expect(fn({ key: 'theKey', lock: { theKey: 12 }})).toBe(12)
  })

  it('parses computed access with another access as property', function() {
    let fn = parse('lock[keys["aKey"]]')
    expect(fn({keys: {aKey: "theKey"}, lock: {theKey: 42}})).toBe(42)
  })

  it('parses a function call', function() {
    let fn = parse('aFunction()')
    expect(fn({ aFunction: function() { return 12 } })).toBe(12)
  })

  it('parses a function call with a single number argument', function() {
    let fn = parse('aFunction(12)')
    expect(fn({ aFunction: function(n) { return n }})).toBe(12)
  })

  it('parses a function call with a identifier argument', function() {
    let fn = parse('aFunction(n)')
    expect(fn({ aFunction: function(n) { return n }, n: 12 })).toBe(12)
  })

  it('parses a function call with a single function call argument', function() {
    let fn = parse('aFunction(argFn())')
    expect(fn({
      aFunction: function(n) { return n },
      argFn: _.constant(12)
  })).toBe(12)})

  it('parses a function call with multiple arguments', function() {
    let fn = parse('aFunction(1, n, argFn())')
    expect(fn({
      n: 2,
      aFunction: function(a, b, c) { return a + b + c },
      argFn: _.constant(12)
  })).toBe(15)})

  it('calls methods accessed as computed properties', function() {
    let scope = {
      anObject: {
        aMember: 12,
        aFunc: function() {
          return this.aMember
        }
      }
    }
    let fn = parse('anObject["aFunc"]()')
    expect(fn(scope)).toBe(12)
  })

  it('calls methods accessed as non-computed properties', function() {
    let scope = {
      anObject: {
        aMember: 12,
        aFunc: function() {
          return this.aMember
        }
      }
    }
    let fn = parse('anObject.aFunc()')
    expect(fn(scope)).toBe(12)
  })

  it('binds bare functions to the scope', function() {
    let scope = {
      aFunc: function() {
        return this
      }
    }
    let fn = parse('aFunc()')
    expect(fn(scope)).toBe(scope)
  })

  it('binds bare functions on locals to the locals', function() {
    let scope = {}
    let locals = {
      aFunc: function() {
        return this
      }
    }
    let fn = parse('aFunc()')
    expect(fn(scope, locals)).toBe(locals)
  })

  it('parses a simple attribute assignment', function() {
    let fn = parse('attr = 12')
    let scope = {}
    fn(scope)
    expect(scope.attr).toBe(12)
  })

  it('can assign any primary expression', function() {
    let fn = parse('attr = aFunc()')
    let scope = { aFunc: _.constant(12) }
    fn(scope)
    expect(scope.attr).toBe(12)
  })

  it('can assign a computed object property', function() {
    let fn = parse('anObject["attr"] = 12')
    let scope = { anObject: {} }
    fn(scope)
    expect(scope.anObject.attr).toBe(12)
  })

  it('can assign a non-computed object property', function() {
    let fn = parse('anObject.attr = 12')
    let scope = { anObject: {} }
    fn(scope)
    expect(scope.anObject.attr).toBe(12)
  })

  it('can assign a nested object property', function() {
    let fn = parse('arr[0]["attr"] = 12')
    let scope = { arr: [{}] }
    fn(scope)
    expect(scope.arr[0].attr).toBe(12)
  })

  it('creates the objects in the assignment path that do not exist', function() {
    let fn = parse('some["nested"].property.path = 12')
    var scope = {}
    fn(scope)
    expect(scope.some.nested.property.path).toBe(12)
  })

  it('does not allow calling the function constructor', function() {
    expect(function() {
      let fn = parse('aFunction.constructor("return window;")()')
      fn({ aFunction: function() { }})
    }).toThrow()
  })

  it('does not allow accessing __proto__', function() {
    expect(function() {
      let fn = parse('obj.__proto__')
      fn({ obj: {} })
    }).toThrow()
  })

  it('does not allow accessing __defineGetter__', function() {
    expect(function() {
      let fn = parse('obj.__defineGetter__("evil", fn)')
      fn({ obj: {}, fn: function() {} })
    }).toThrow()
  })

  it('does not allow accessing __defineSetter__', function() {
    expect(function() {
      let fn = parse('obj.__defineSetter__("evil", fn)')
      fn({ obj: {}, fn: function() {} })
    }).toThrow()
  })

  it('does not allow accessing __lookupGetter__', function() {
    expect(function() {
      let fn = parse('obj.__lookupGetter__("evil")')
      fn({ obj: {} })
    }).toThrow()
  })

  it('does not allow accessing __lookupSetter__', function() {
    expect(function() {
      let fn = parse('obj.__lookupSetter__("evil")')
      fn({ obj: {} })
    }).toThrow()
  })

  it('forbids accessing window as computed property', function() {
    let fn = parse('anObject["wnd"]')
    expect(function() { fn({anObject: { wnd: window } }) }).toThrow()
  })

  it('forbids accessing window as non-computed property', function() {
    let fn = parse('anObject.wnd')
    expect(function() { fn({anObject: { wnd: window } }) }).toThrow()
  })

  it('does not allow passing window as function argument', function() {
    let fn = parse('aFunction(wnd)')
    expect(function() {
      fn({ aFunction: function() {}, wnd: window })
    }).toThrow()
  })

  it('does not allow calling methods on window', function() {
    let fn = parse('wnd.scrollTo(0, 0)')
    expect(function () {
      fn({wnd: window})
    }).toThrow()
  })

  it('does not allow functions to return window', function() {
    let fn = parse('getWnd()')
    expect(function() {
      fn({ getWnd: _.constant(window) })
    }).toThrow()
  })

  it('does not allow assignment on window', function() {
    let fn = parse('wnd = anObject')
    expect(function() {
      fn({ anObject: window })
    }).toThrow()
  })

  it('does not allow Referencing window', function() {
    let fn = parse('wnd')
    expect(function() {
      fn({wnd: window})
    }).toThrow()
  })

  it('does not allow calling functions on DOM elements', function() {
    let fn = parse('el.setAttribute("evil", "true")')
    expect(function () {
      fn({ el: document.documentElement })
    }).toThrow()
  })

  it('does not allow calling the alias function constructor', function() {
    let fn = parse('fnConstructor("return window;")')
    expect(function() {
      fn({fnConstructor: (function(){}).constructor })
    }).toThrow()
  })

  it('does not allow calling functions on Object', function() {
    let fn = parse('obj.create({})')
    expect(function() {
      fn({ obj: Object })
    }).toThrow()
  })

  it('does not allow calling `call`', function() {
    let fn = parse('fun.call(obj)')
    expect(function() {
      fn({ fun: function(){}, obj: {}})
    }).toThrow()
  })

  it('does not allow calling `apply`', function() {
    let fn = parse('fun.call(obj)')
    expect(function() {
      fn({ fun: function(){}, obj: {}})
    }).toThrow()
  })

  it('parses a unary "+"', function() {
    expect(parse('+12')()).toBe(12)
    expect(parse('+a')({a: 12})).toBe(12)
  })

  it('replaces undefined with zero for unary "+"', function() {
    expect(parse('+a')({})).toBe(0)
  })

  it('parses a unary "!"', function() {
    expect(parse('!true')()).toBe(false)
    expect(parse('!42')()).toBe(false)
    expect(parse('!a')({a: false})).toBe(true)
    expect(parse('!!a')({a: false})).toBe(false)
  })

  it('parses a unary "-"', function() {
    expect(parse('-12')()).toBe(-12)
    expect(parse('-a')({a: 12})).toBe(-12)
    expect(parse('--a')({a: 12})).toBe(12)
    expect(parse('-a')({})).toBe(0)
  })

  it('parses a "!" in a string', function() {
    expect(parse('"!"')()).toBe('!')
  })

  it('parses a multiplication', function() {
    expect(parse('12 * 12')()).toBe(144)
  })

  it('parses a division', function() {
    expect(parse('12 / 12')()).toBe(1)
  })

  it('parses a remainder', function() {
    expect(parse('12 % 12')()).toBe(0)
  })

  it('parses several multiplicatives', function() {
    expect(parse('36 * 2 % 5')()).toBe(2)
  })

  it('parses an addition', function() {
    expect(parse('11 + 12')()).toBe(23)
  })

  it('parses a subtraction', function() {
    expect(parse('11 - 12')()).toBe(-1)
  })

  it('parses multiplicatives on a higher precedence than additives', function() {
    expect(parse('2 + 3 * 5')()).toBe(17)
    expect(parse('2 + 3 * 2 + 3')()).toBe(11)
  })

  it('substitutes undefined with zero in addition', function() {
    expect(parse('a + 22')()).toBe(22)
    expect(parse('12 + a')()).toBe(12)
  })

  it('substitutes undefined with zero in subtraction', function() {
    expect(parse('a - 22')()).toBe(-22)
    expect(parse('12 - a')()).toBe(12)
  })

  it('parses relational operators', function() {
    expect(parse('1 < 2')()).toBe(true)
    expect(parse('1 > 2')()).toBe(false)
    expect(parse('1 <= 2')()).toBe(true)
    expect(parse('2 <= 2')()).toBe(true)
    expect(parse('1 >= 2')()).toBe(false)
    expect(parse('2 >= 2')()).toBe(true)
  })

  it('parses equality operators', function() {
    expect(parse('12 == 12')()).toBe(true)
    expect(parse('12 == "12"')()).toBe(true)
    expect(parse('12 != 12')()).toBe(false)
    expect(parse('12 === 12')()).toBe(true)
    expect(parse('12 === "12"')()).toBe(false)
    expect(parse('12 !== 12')()).toBe(false)
  })

  it('parses relationals on a higher precedence than equality', function() {
    expect(parse('2 == "2" > 2 === "2"')()).toBe(false)
  })

  it('parses additives on a higher precedence than relationals', function() {
    expect(parse('2 + 3 < 6 - 2')()).toBe(false)
  })

  it('parses logical AND', function() {
    expect(parse( 'true && true' )()).toBe(true)
    expect(parse( 'true && false' )()).toBe(false)
  })
  it('parses logical OR', function() {
    expect(parse( 'true || true' )()).toBe(true)
    expect(parse( 'true || false' )()).toBe(true)
    expect(parse( 'fales || false' )()).toBe(false)
  })

  it('parses multiple ANDs', function() {
    expect(parse( 'true && true && true' )()).toBe(true)
    expect(parse( 'true && true && false' )()).toBe(false)
  })

  it('parses multiple ORs', function() {
    expect(parse( 'true || true || true')()).toBe(true)
    expect(parse( 'true || true || false' )()).toBe(true)
    expect(parse( 'false || false || true' )()).toBe(true)
    expect(parse( 'false || false || false' )()).toBe(false)
  })

  it('short-circuits AND', function() {
    let invoked
    let scope = { fn: function() { invoked = true }}

    parse('false && fn()')(scope)

    expect(invoked).toBeUndefined()
  })

  it('short-circuits OR', function() {
    let invoked
    let scope = { fn: function() { invoked = true }}

    parse('true || fn()')(scope)

    expect(invoked).toBeUndefined()
  })

  it('parses AND with a higher precedence than OR', function() {
    expect(parse('false && true || true')()).toBe(true)
  })

  it('parses OR with a lower precedence than equality', function() {
    expect(parse('1 === 2 || 2 === 2')()).toBeTruthy()
  })

  it('parses the ternary expression', function() {
    expect(parse('a === 12 ? true : false')({a: 12})).toBe(true)
    expect(parse('a === 11 ? true : false')({a: 12})).toBe(false)
  })

  it('parses OR with a higer precedence than ternary', function() {
    expect(parse('0 || 1 ? 0 || 2 : 0 || 3')()).toBe(2)
  })

  it('parses nested ternaries', function() {
    expect(
      parse('a === 42 ? b === 42 ? "a and b" : "a" : c === 12 ? "c" : "none"')({
        a: 10,
        b: 11,
        c: 12
      })
    ).toEqual('c')
  })

  it('parses parentheses altering precedence order', function() {
    expect(parse('12 * (3 - 1)')()).toBe(24)
    expect(parse('false && (true || true)')()).toBe(false)
    expect(parse('-((a % 2) === 0 ? 1 : 2)')({a: 42})).toBe(-1)
  })

  it('parses several statements', function() {
    let fn = parse('a = 1; b=2; c =3')
    let scope = {}
    fn(scope)
    expect(scope).toEqual({a: 1, b: 2, c: 3})
  })

  it('returns the value of the last statement', function() {
    expect(parse('a=1; b = 2; a+b')({})).toBe(3)
  })

  it('can parse filter expressions', function() {
    register('upcase', function() {
      return function(str) {
        return str.toUpperCase()
      }
    })
    let fn = parse('aString | upcase')
    expect(fn({aString: 'Hello'})).toEqual('HELLO')
  })

  it('can parse filter chain expressions', function() {
    register('upcase', function() {
      return s => s.toUpperCase()
    })
    register('exclamate', function() {
      return s => s + '!'
    })
    let fn = parse('"Hello" | upcase | exclamate')
    expect(fn()).toEqual('HELLO!')
  })

  it('can pass an additional argument to filters', function() {
    register('repeat', function() {
      return (s, times) => _.repeat(s, times)
    })
    let fn = parse('"hello" | repeat:3')
    expect(fn()).toEqual('hellohellohello')
  })

  it('can pass several additional arguments to filters', function() {
    register('surround', function() {
      return (s, left, right) => left + s + right
    })
    let fn = parse('"hello" | surround:"*":"!"')
    expect(fn()).toEqual('*hello!')
  })
})
