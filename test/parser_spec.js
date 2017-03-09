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

})


































// eof
