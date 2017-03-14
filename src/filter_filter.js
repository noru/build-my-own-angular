
function filterFilter() {
  return function(array, filterExpr, comparator) {
    let predicateFn
    if (_.isFunction(filterExpr)) {
      predicateFn = filterExpr
    } else if (
      _.isString(filterExpr) ||
      _.isNumber(filterExpr) ||
      _.isBoolean(filterExpr) ||
      _.isObject(filterExpr) ||
      _.isNull(filterExpr)) {
      predicateFn = createPredicateFn(filterExpr, comparator)
    } else {
      return array
    }
    return _.filter(array, predicateFn)
  }
}

function createPredicateFn(expr, comparator) {

  let shouldMatchPrimitives = _.isObject(expr) && ('$' in expr)

  if (comparator === true) {
    comparator = _.isEqual
  } else if (!_.isFunction(comparator)) {
    comparator = function(actual, expected) {
        if (_.isUndefined(actual)) {
          return false
        }
        if (_.isNull(actual) || _.isNull(expected)) {
          return actual === expected
        }
        actual = ('' + actual).toLowerCase()
        expected = ('' + expected).toLowerCase()

        return actual.indexOf(expected) !== -1
      }
  }

  function deepCompare(actual, expected, comparator, matchAnyProperty, inWildcard) {
    if (_.isString(expected) && _.startsWith(expected, '!')) {
      return !deepCompare(actual, expected.substring(1), comparator, matchAnyProperty)
    }

    if (_.isArray(actual)) {
      return _.some(actual, actualItem => deepCompare(actualItem, expected, comparator, matchAnyProperty))
    }

    if (_.isObject(actual)) {
      if (_.isObject(expected) && !inWildcard) {
        return _.every(_.toPlainObject(expected), (expectedVal, expectedKey) => {
          if (_.isUndefined(expectedVal)) {
            return true
          }
          let isWildcard = (expectedKey === '$')
          let actualVal = isWildcard ? actual : actual[expectedKey]
          return deepCompare(actualVal, expectedVal, comparator, isWildcard, isWildcard)
        })
      } else if (matchAnyProperty){
        return _.some(actual, value => deepCompare(value, expected, comparator, matchAnyProperty))
      } else {
        return comparator(actual, expected)
      }
    } else {
      return comparator(actual, expected)
    }
  }
  return function predicateFn(item) {
    if (shouldMatchPrimitives && !_.isObject(item)) {
      return deepCompare(item, expr.$, comparator)
    }
    return deepCompare(item, expr, comparator, true)
  }
}

register('filter', filterFilter)
