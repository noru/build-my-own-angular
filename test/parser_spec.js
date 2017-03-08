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










})


































// eof
