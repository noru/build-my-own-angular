
describe('filter', function() {

  it ('can be registered and obtained', function() {
    let myFilter = function() {}
    let myFilterFactory = function() {
      return myFilter
    }
    register('my', myFilterFactory)
    expect(filter('my')).toBe(myFilter)
  })

  it('allows registering multiple filters with an object', function() {
    let myFilter = function() {}
    let myOtherFilter = function() {}
    register({
      my: () => myFilter,
      myOther: () => myOtherFilter
    })

    expect(filter('my')).toBe(myFilter)
    expect(filter('myOther')).toBe(myOtherFilter)
  })
})
