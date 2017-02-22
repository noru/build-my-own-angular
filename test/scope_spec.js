describe('Scope', function() {

  it('can be constructed and use', function() {

    let scope = new Scope()
    scope.a = 1
    expect(scope.a).toBe(1)
  })

  describe('$digest', function() {

    let scope
    beforeEach(() => scope = new Scope)

    it('calls the listener of a watch on first $digest', function() {

      let watchFn = () => 'watch'
      let listenerFn = jasmine.createSpy()

      scope.$watch(watchFn, listenerFn)
      scope.$digest()

      expect(listenerFn).toHaveBeenCalled()
    })

    it('calls the watch function with the scope as the argument', function() {

      let watchFn = jasmine.createSpy()
      let listenerFn = function() { }
      scope.$watch(watchFn, listenerFn)

      scope.$digest()

      expect(watchFn).toHaveBeenCalledWith(scope)
    })

    it('calls the listener function when the watched value changes', function() {

      scope.someValue = 'a'
      scope.counter = 0

      scope.$watch(
        function(scope) { return scope.someValue },
        function(newVal, oldVal, scope) { scope.counter++ }
      )

      expect(scope.counter).toBe(0)

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.someValue = 'b'
      expect(scope.counter).toBe(1)

      scope.$digest()
      expect(scope.counter).toBe(2)

    })

    it('calls listener when watch value is first undefined', function() {

      scope.counter = 0

      scope.$watch(
        function(scope) { return scope.someValue },
        function(newVal, oldVal, scope) { scope.counter++ }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('calls listener with new value as old value the first time', function() {

      scope.someValue = 123
      let oldValueGiven
      scope.$watch(
        function(scope) { return scope.someValue },
        function(newVal, oldVal, scope) { oldValueGiven = oldVal }
      )

      scope.$digest()
      expect(oldValueGiven).toBe(123)
    })

    it('may have wathers that omit the listener function', function() {

      var watchFn = jasmine.createSpy().and.returnValue('something')
      scope.$watch(watchFn)

      scope.$digest()

      expect(watchFn).toHaveBeenCalled()
    })

    it('triggers chained watchers in the same digest', function() {

      scope.name = 'Xiu'

      scope.$watch(
        function(scope) { return scope.nameUpper },
        function(newVal, oldVal, scope) {
          if (newVal) {
            scope.initial = newVal.substring(0, 1) + '.'
          }
        }
      )
      scope.$watch(
        function(scope) { return scope.name },
        function(newVal, oldVal, scope) {
          if(newVal) {
            scope.nameUpper = newVal.toUpperCase()
          }
        }
      )

      scope.$digest()
      expect(scope.initial).toBe('X.')

      scope.name = 'Zhu'
      scope.$digest()
      expect(scope.initial).toBe('Z.')
    })

    it('give up on the watches after 10 iterations', function() {

      scope.counterA = 0
      scope.counterB = 0

      scope.$watch(
        function(scope) { return scope.counterA },
        function(newVal, oldVal, scope) {
          scope.counterB++
        }
      )
      scope.$watch(
        function(scope) { return scope.counterB },
        function(newVal, oldVal, scope) {
          scope.counterA++
        }
      )

      expect((function() { scope.$digest() })).toThrow()
    })

    it('ends the digest when the last watch is clean', function() {

      scope.array = _.range(100)
      let watchExecutions = 0

      _.times(100, function(i) {
        scope.$watch(
          function(scope) {
            watchExecutions++
            return scope.array[i]
          },
          function(newVal, oldVal, scope) {

          }
        )
      })

      scope.$digest()
      expect(watchExecutions).toBe(200)

      scope.array[0] = 420
      scope.$digest()
      expect(watchExecutions).toBe(301)
    })

    it('does not end digest so that new watches are not run', function() {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.$watch(
            function(scope) { return scope.aValue },
            function(newVal, oldValue, scope) {
              scope.counter++
            }
          )
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('compares based on value if enabled', function() {

      scope.aValue = [1, 2, 3]
      scope.counter = 0

      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        },
        true
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.aValue.push(4)
      scope.$digest()
      expect(scope.counter).toBe(2)
    })

    it('correctly handles NaNs', function() {

      scope.number = 0/0
      scope.counter = 0

      scope.$watch(
        function(scope) { return scope.number },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('executes $eval`ed function and returns result', function() {

      scope.aValue = 42
      let result = scope.$eval(function(scope) {
        return scope.aValue
      })

      expect(result).toBe(42)
    })

    it('passes the second $eval argument straight through', function() {

      scope.aValue = 42
      let result = scope.$eval(function(scope, arg) {
        return scope.aValue + arg
      }, 2)

      expect(result).toBe(44)
    })

    it('executes $apply`ed function and startes the digest', function() {

      scope.aValue = 'someValue'
      scope.counter = 0

      scope.$watch(
        function() {
          return scope.aValue
        },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$apply(function(scope) {
        scope.aValue = 'someOtherValue'
      })

      expect(scope.counter).toBe(2)
    })

    it('executes $evalAsync`ed function later in the same cycle', function() {

      scope.aValue = [1, 2, 3]
      scope.asyncEvaluated = false
      scope.asyncEvaluatedImmediately = false

      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.$evalAsync(function(scope) {
            scope.asyncEvaluated = true
          })
          scope.asyncEvaluatedImmediately = scope.asyncEvaluated
        }
      )

      scope.$digest()
      expect(scope.asyncEvaluated).toBe(true)
      expect(scope.asyncEvaluatedImmediately).toBe(false)
    })

    it('executes $evalAsync`ed functions added by watch functions', function() {

      scope.aValue = [1, 2, 3]
      scope.asyncEvaluated = false

      scope.$watch(
        function(scope) {
          if (!scope.asyncEvaluated) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluated = true
            })
          }
          return scope.aValue
        },
        function(newVal, oldVal, scope) { }
      )

      scope.$digest()

      expect(scope.asyncEvaluated).toBe(true)
    })

    it('executes $evalAsync`ed functions even when not dirty', function() {

      scope.aValue = [1, 2, 3]
      scope.asyncEvaluatedTimes = 0

      scope.$watch(
        function(scope) {
          if (scope.asyncEvaluatedTimes < 2) {
            scope.$evalAsync(function(scope) {
              scope.asyncEvaluatedTimes++
            })
          }
          return scope.aValue
        },
        function(newVal, oldVal, scope) { }
      )

      scope.$digest()

      expect(scope.asyncEvaluatedTimes).toBe(2)
    })

    it('eventually halts $evalAsyncs added by watches', function() {

      scope.aValue = [1, 2, 3]

      scope.$watch(
        function(scope) {
          scope.$evalAsync(function(scope) { })
        },
        function(newVal, oldVal, scope) { }
      )

      expect(function() { scope.$digest() }).toThrow()
    })

    it('has a $$phase field whose value is the current digest phase', function() {

      scope.aValue = [1, 2, 3]
      scope.phaseInWatchFn = undefined
      scope.phaseInListenerFn = undefined
      scope.phaseInApplyFn = undefined

      scope.$watch(
        function(scope) {
          scope.phaseInWatchFn = scope.$$phase
          return scope.aValue
        },
        function(newVal, oldVal, scope) {
          scope.phaseInListenerFn = scope.$$phase
        }
      )

      scope.$apply(function(scope) {
        scope.phaseInApplyFn = scope.$$phase
      })

      expect(scope.phaseInWatchFn).toBe('$digest')
      expect(scope.phaseInListenerFn).toBe('$digest')
      expect(scope.phaseInApplyFn).toBe('$apply')
    })

    it('schedules a digest in $evalAsync', function(done) {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$evalAsync(function(scope) {
      })

      expect(scope.counter).toBe(0)
      setTimeout(function() {
        expect(scope.counter).toBe(1)
        done()
      }, 50)
    })

    it('allows async $apply with $applyAsync', function(done) {

      scope.counter = 0

      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$applyAsync(function(scope) {
        scope.aValue = 'abc'
      })
      expect(scope.counter).toBe(1)

      setTimeout(function() {
        expect(scope.counter).toBe(2)
        done()
      }, 50)
    })

    it('never executes $applyAsync`ed function in the same cycle', function(done) {

      scope.aValue = [1, 2, 3]
      scope.asyncApplied = false

      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.$applyAsync(function(scope) {
            scope.asyncApplied = true
          })
        }
      )

      scope.$digest()
      expect(scope.asyncApplied).toBe(false)
      setTimeout(function() {
        expect(scope.asyncApplied).toBe(true)
        done()
      }, 50)
    })

    it('coalesces many calls to $applyAsync', function(done) {
      scope.counter = 0

      scope.$watch(
        function(scope) {
          scope.counter++
          return scope.aValue
        },
        function(newVal, oldVal, scope) { }
      )

      scope.$applyAsync(function(scope) {
        scope.aValue = 'abc'
      })

      scope.$applyAsync(function(scope) {
        scope.aValue = 'def'
      })

      setTimeout(function() {
        expect(scope.counter).toBe(2)
        done()
      }, 50)
    })

    it('cancels and flushes $applyAsync if digested first', function(done) {

      scope.counter = 0

      scope.$watch(
        function(scope) {
          scope.counter++
          return scope.aValue
        },
        function(newVal, oldVal, scope) { }
      )
      scope.$applyAsync(function(scope) {
        scope.aValue = 'abc'
      })
      scope.$applyAsync(function(scope) {
        scope.aValue = 'def'
      })

      scope.$digest()

      expect(scope.counter).toBe(2)
      expect(scope.aValue).toEqual('def')

      setTimeout(function() {
        expect(scope.counter).toBe(2)
        done()
      }, 50)

    })

    it('runs a $$postDigest function after each digest', function() {

      scope.counter = 0

      scope.$$postDigest(function() {
        scope.counter++
      })

      expect(scope.counter).toBe(0)

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('does not include $$postDigest in the digest', function() {

      scope.aValue = 'old value'

      scope.$$postDigest(function() {
        scope.aValue = 'new value'
      })
      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.watchedValue = newVal
        }
      )

      scope.$digest()
      expect(scope.watchedValue).toBe('old value')

      scope.$digest()
      expect(scope.watchedValue).toBe('new value')
    })

    it('catches exceptions in watch functions and continues', function() {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function(scope) { throw 'error' },
        function(newVal, oldVal, scope) { }
      )
      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('catches exceptions in listener functions and continues', function() {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          throw 'error'
        }
      )
      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )
      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('catches exceptions in $evalAsync', function(done) {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function() { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )
      scope.$evalAsync(function(scope) {
        throw 'error'
      })

      setTimeout(function() {
        expect(scope.counter).toBe(1)
        done()
      }, 50)
    })

    it('catches exceptions in $applyAsync', function(done) {

      scope.$applyAsync(function(scope) {
        throw 'error'
      })
      scope.$applyAsync(function(scope) {
        throw 'error'
      })
      scope.$applyAsync(function(scope) {
        scope.applied = true
      })

      setTimeout(function() {
        expect(scope.applied).toBe(true)
        done()
      }, 50)
    })

    it('catches exceptions in $$postDigest', function() {

      let didRun = false

      scope.$$postDigest(function() {
        throw 'error'
      })
      scope.$$postDigest(function() {
        didRun = true
      })

      scope.$digest()
      expect(didRun).toBe(true)
    })

    it('allows destroying a $watch with a removal function', function() {

      scope.aValue = 'abc'
      scope.counter = 0

      let destroyWatch = scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)

      scope.aValue = 'def'
      scope.$digest()
      expect(scope.counter).toBe(2)

      scope.aValue = 'ghi'

      destroyWatch()
      scope.$digest()
      expect(scope.counter).toBe(2)
    })

    it('allows destroying a $watch during digest', function() {

      scope.aValue = 'abc'

      let watchCalls = []

      scope.$watch(
        function(scope) {
          watchCalls.push('1st')
        }
      )
      let destroyWatch = scope.$watch(
        function(scope) {
          watchCalls.push('2nd')
          destroyWatch()
        }
      )
      scope.$watch(
        function(scope) {
          watchCalls.push('3rd')
        }
      )

      scope.$digest()
      expect(watchCalls).toEqual(['1st', '2nd', '3rd', '1st', '3rd'])
    })

    it('allows a $watch to destroy another during digest', function() {

      scope.aValue = 'abc'
      scope.counter = 0

      scope.$watch(
        function(scope) {
          return scope.aValue
        },
        function(newVal, oldVal, scope) {
          destroyWatch()
        }
      )
      let destroyWatch = scope.$watch(
        function(scope) { },
        function(newVal, oldVal, scope) { }
      )
      scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
            scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(1)
    })

    it('allows destroying multiple watchers during digest',function() {

      scope.aValue = 'abc'
      scope.counter = 0

      let destroyWatch1 = scope.$watch(
        function(scope) {
          destroyWatch1()
          destroyWatch2()
        }
      )

      let destroyWatch2 = scope.$watch(
        function(scope) { return scope.aValue },
        function(newVal, oldVal, scope) {
          scope.counter++
        }
      )

      scope.$digest()
      expect(scope.counter).toBe(0)
    })























  })

  describe('$watchGroup', function() {

    var scope
    beforeEach(function() {
      scope = new Scope
    })

    it('takes watches as an array and calls listener with arrays', function() {

      let gotNewValues, gotOldValues

      scope.aValue = 1
      scope.anotherValue = 2

      scope.$watchGroup([
        function(scope) { return scope.aValue },
        function(scope) { return scope.anotherValue }
      ], function(newVals, oldVals, scope) {
        gotNewValues = newVals
        gotOldValues = oldVals
      })
      scope.$digest()

      expect(gotNewValues).toEqual([1, 2])
      expect(gotOldValues).toEqual([1, 2])
    })

    it('only calls listener once per digest', function() {

      let counter = 0

      scope.aValue = 1
      scope.anotherValue = 2

      scope.$watchGroup([
        function(scope) { return scope.aValue },
        function(scope) { return scope.anotherValue }
      ], function(newVals, oldVals, scope) {
        counter++
      })

      scope.$digest()

      expect(counter).toEqual(1)
    })

    it('uses the same array of old and new values on first run', function() {

      let gotNewValues, gotOldValues

      scope.aValue = 1
      scope.anotherValue = 2

      scope.$watchGroup([
        function(scope) { return scope.aValue },
        function(scope) { return scope.anotherValue }
      ], function(newVals, oldVals, scope) {
        gotNewValues = newVals
        gotOldValues = oldVals
      })
      scope.$digest()

      expect(gotNewValues).toBe(gotOldValues)
    })

    it('uses different arrays for old and new values on subsequent runs', function() {

      let gotNewValues, gotOldValues

      scope.aValue = 1
      scope.anotherValue = 2

      scope.$watchGroup([
        function(scope) { return scope.aValue },
        function(scope) { return scope.anotherValue }
      ], function(newVals, oldVals, scope) {
        gotNewValues = newVals
        gotOldValues = oldVals
      })
      scope.$digest()

      scope.anotherValue = 3
      scope.$digest()

      expect(gotNewValues).toEqual([1, 3])
      expect(gotOldValues).toEqual([1, 2])
    })

    it('calls the listener once when the watch array is empty', function() {

      let gotNewValues, gotOldValues

      scope.$watchGroup([], function(newVals, oldVals, scope) {
        gotNewValues = newVals
        gotOldValues = oldVals
      })
      scope.$digest()

      expect(gotNewValues).toEqual([])
      expect(gotOldValues).toEqual([])
    })

    it('can be deregistered', function() {

      let counter = 0

      scope.aValue = 1
      scope.anotherValue = 2

      let destroyGroup = scope.$watchGroup([
        function(scope) { return scope.aValue },
        function(scope) { return scope.anotherValue }
      ], function(newVals, oldVals, scope) {
        counter++
      })

      scope.$digest()

      scope.anotherValue = 3
      destroyGroup()
      scope.$digest()

      expect(counter).toEqual(1)
    })

    it('does not call the zero-watch listener when deregistered first', function() {

      let counter = 0
      let destroyGroup = scope.$watchGroup([], function(newVals, oldVals, scope) {
        counter++
      })
      destroyGroup()
      scope.$digest()

      expect(counter).toEqual(0)
    })













































  })
})
