
describe('filter filter', function() {

  it ('is available', function() {
    expect(filter('filter')).toBeDefined()
  })

  it('can filter an array with a predicate function', function() {
    let fn = parse('[1,2,3,4] | filter:isOdd')
    let scope = {
      isOdd: function(n) {
        return n % 2 !== 0
      }
    }
    expect(fn(scope)).toEqual([1, 3])
  })

  it('can filter an array of strings with a string', function() {
    let fn = parse('arr | filter:"a"')
    expect(fn({arr: ["a", "b", "a"]})).toEqual(['a', 'a'])
  })

  it('filters an array of strings with substring matching', function() {
    let fn = parse('arr | filter: "o"')
    expect(fn({arr: ['quick', 'brown', 'fox']})).toEqual(['brown', 'fox'])
  })

  it('filters an array of strings ignoring case', function() {
    let fn = parse('arr | filter: "o"')
    expect(fn({arr: ['quick', 'BROWN', 'fox']})).toEqual(['BROWN', 'fox'])
  })

  it('filters an array of objects where a nested value matches', function() {
    let fn = parse('arr | filter: "o"')
    expect(fn({
      arr: [
        { name: { first: 'John', last: 'Brown' } },
        { name: { first: 'Jane', last: 'Fox' } },
        { name: { first: 'Mary', last: 'Quick' } },
      ]
    })).toEqual([
      { name: { first: 'John', last: 'Brown' } },
      { name: { first: 'Jane', last: 'Fox' } },
    ])
  })

  it('filters an array of arrays where a nested value matches', function() {
    let fn = parse('arr | filter: "o"')
    expect(fn({
      arr: [
        [ {name: 'John'}, {name: 'Mary'}],
        [ {name: 'Jane'}],
      ]
    })).toEqual([
      [ {name: 'John'}, {name: 'Mary'}],
    ])
  })

  it('filters with a number', function() {
    let fn = parse('arr | filter: 12')
    expect(fn({arr: [
      {name: 'Marry', age: 32},
      {name: 'Holand', age: 12},
      {name: 'Rechard', age: 32},
    ]})).toEqual([
      {name: 'Holand', age: 12},
    ])
  })

  it('filters with a boolean', function() {
    let fn = parse('arr | filter: true')
    expect(fn({arr: [
      {name: 'Marry', admin: true},
      {name: 'Holand', admin: true},
      {name: 'Rechard', admin: false},
    ]})).toEqual([
      {name: 'Marry', admin: true},
      {name: 'Holand', admin: true},
    ])
  })

  it('filters with a substring numeric value', function() {
    let fn = parse('arr | filter:12')
    expect(fn({arr: ['contains 12']})).toEqual(['contains 12'])
  })

  it('filters matching null', function() {
    let fn = parse('arr | filter:null')
    expect(fn({arr: [null, 'not null']})).toEqual([null])
  })

  it('filters matching null, but not string', function() {
    let fn = parse('arr | filter:"null"')
    expect(fn({arr: [null, 'not null']})).toEqual(['not null'])
  })

  it('filters matching null, but not string', function() {
    let fn = parse('arr | filter:"null"')
    expect(fn({arr: [null, 'not null']})).toEqual(['not null'])
  })

  it('does not match undefined values', function() {
    let fn = parse('arr | filter:"undefined"')
    expect(fn({arr: [undefined, 'undefined']})).toEqual(['undefined'])
  })

  it('allows negating string filter', function() {
    let fn = parse('arr | filter: "!o"')
    expect(fn({arr: ['quick', 'brown', 'fox']})).toEqual(['quick'])
  })

  it('filters with an object', function() {
    let fn = parse('arr | filter: {name:"o"}')
    expect(fn({arr: [
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ]})).toEqual([
      {name: 'Joe', role: 'admin'}
    ])
  })

  it('matches all criteria in an object', function() {
    let fn = parse('arr | filter: {name:"o", role: "m"}')
    expect(fn({arr: [
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ]})).toEqual([
      {name: 'Joe', role: 'admin'}
    ])
  })

  it('matches all when filtered with an empty object', function() {
    let fn = parse('arr | filter: {}')
    expect(fn({arr: [
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ]})).toEqual([
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ])
  })

  it('filters with a nested object', function() {
    let fn = parse('arr | filter: {name: {first: "o"}, role: "m"}')
    expect(fn({arr: [
      {name: {first: 'Joe'}, role: 'admin'},
      {name: {first: 'Jane'}, role: 'moderator'},
    ]})).toEqual([
      {name: {first: 'Joe'}, role: 'admin'}
    ])
  })

  it('allows negation when filtering with an object', function() {
    let fn = parse('arr | filter: {name: {first: "!o"}}')
    expect(fn({arr: [
      {name: {first: 'Joe'}, role: 'admin'},
      {name: {first: 'Jane'}, role: 'moderator'},
    ]})).toEqual([
      {name: {first: 'Jane'}, role: 'moderator'},
    ])
  })

  it('ignores undefined values in exceptation object', function() {
    let fn = parse('arr | filter: {name: thisIsUndefined}')
    expect(fn({arr: [
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ]})).toEqual([
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ])
  })

  it('filters with a nested object in array', function() {
    let fn = parse('arr | filter:{users:{name: {first: "o"}}}')
    expect(fn({
      arr: [
        {users: [
          {name: {first: 'Joe'}, role: 'admin'},
          {name: {first: 'Jane'}, role: 'moderator'},
        ]},
        {users: [{
          name: {first: 'Mary'}, role: 'admin'},
        ]},
      ]
    })).toEqual([
      {users: [
        {name: {first: 'Joe'}, role: 'admin'},
        {name: {first: 'Jane'}, role: 'moderator'},
      ]}
    ])
  })

  it('filters with nested objects on the same level only', function() {

    let items = [
      {user: 'Bob'},
      {user: {name: 'Bob'}},
      {user: {name: {first: 'Bob', last: 'Fox'}}}
    ]
    let fn = parse('arr | filter:{user:{name:"Bob"}}')
    expect(fn({
      arr: items
    })).toEqual([{user: {name: 'Bob'}}])
  })

  it('filters with a wildcard property', function() {
    let fn = parse('arr | filter:{$: "o"}')
    expect(fn({
      arr: [
        {name: 'Joe', role: 'admin'},
        {name: 'Jane', role: 'moderator'},
        {name: 'Mary', role: 'admin'},
      ]
    })).toEqual([
      {name: 'Joe', role: 'admin'},
      {name: 'Jane', role: 'moderator'},
    ])
  })

  it('filters nested objects with a wildcard property', function() {
    let fn = parse('arr | filter:{$: "o"}')
    expect(fn({
      arr: [
        {name: {first: 'Joe'}, role: 'admin'},
        {name: {first: 'Jane'}, role: 'moderator'},
        {name: {first: 'Mary'}, role: 'admin'},
      ]
    })).toEqual([
      {name: {first: 'Joe'}, role: 'admin'},
      {name: {first: 'Jane'}, role: 'moderator'},
    ])
  })

  it('filters wildcard properties scoped to parent', function() {
    let fn = parse('arr | filter:{name:{$: "o"}}')
    expect(fn({
      arr: [
        {name: {first: 'Joe', last: 'Fox'}, role: 'admin'},
        {name: {first: 'Jane', last: 'Quick'}, role: 'moderator'},
        {name: {first: 'Mary', last: 'Brown'}, role: 'admin'},
      ]
    })).toEqual([
      {name: {first: 'Joe', last: 'Fox'}, role: 'admin'},
      {name: {first: 'Mary', last: 'Brown'}, role: 'admin'},
    ])
  })

  it('filters primitives with a wildcard property', function() {
    let fn = parse('arr | filter:{$: "o"}')
    expect(fn({arr: ['Joe', 'Jane', 'Mary']})).toEqual(['Joe'])
  })

  it('filters with a nested wildcard property', function() {
    let fn = parse('arr | filter:{$:{$:"o"}}')
    expect(fn({
      arr: [
        {name: {first: 'Joe'}, role: 'admin'},
        {name: {first: 'Jane'}, role: 'moderator'},
        {name: {first: 'Mary'}, role: 'admin'},
      ]
    })).toEqual([
      {name: {first: 'Joe'}, role: 'admin'},
    ])
  })

  it('allows using a custom comparator', function() {
    let fn = parse('arr | filter:{$:"o"}:myComparator')
    expect(fn({
      arr: ['o', 'oo', 'ao', 'aa'],
      myComparator: (left, right) => left === right
    })).toEqual(['o'])
  })

  it('allows using an equality comparator', function() {
    let fn = parse('arr | filter:{name: "Jo"}:true')
    expect(fn({
      arr: [
        {name: 'Jo'},
        {name: 'Joe'}
      ]
    })).toEqual([{name: 'Jo'}])
  })

})
