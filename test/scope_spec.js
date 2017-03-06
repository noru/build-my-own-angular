describe('Scope', function() {

  it('can be constructed and use', function() {

    let scope = new Scope()
    scope.a = 1
    expect(scope.a).toBe(1)
  })

  // describe('$digest', function() {
  //
  //   let scope
  //   beforeEach(() => scope = new Scope)
  //
  //   it('calls the listener of a watch on first $digest', function() {
  //
  //     let watchFn = () => 'watch'
  //     let listenerFn = jasmine.createSpy()
  //
  //     scope.$watch(watchFn, listenerFn)
  //     scope.$digest()
  //
  //     expect(listenerFn).toHaveBeenCalled()
  //   })
  //
  //   it('calls the watch function with the scope as the argument', function() {
  //
  //     let watchFn = jasmine.createSpy()
  //     let listenerFn = function() { }
  //     scope.$watch(watchFn, listenerFn)
  //
  //     scope.$digest()
  //
  //     expect(watchFn).toHaveBeenCalledWith(scope)
  //   })
  //
  //   it('calls the listener function when the watched value changes', function() {
  //
  //     scope.someValue = 'a'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) { return scope.someValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     expect(scope.counter).toBe(0)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.someValue = 'b'
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //   })
  //
  //   it('calls listener when watch value is first undefined', function() {
  //
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) { return scope.someValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('calls listener with new value as old value the first time', function() {
  //
  //     scope.someValue = 123
  //     let oldValueGiven
  //     scope.$watch(
  //       function(scope) { return scope.someValue },
  //       function(newVal, oldVal, scope) { oldValueGiven = oldVal }
  //     )
  //
  //     scope.$digest()
  //     expect(oldValueGiven).toBe(123)
  //   })
  //
  //   it('may have wathers that omit the listener function', function() {
  //
  //     var watchFn = jasmine.createSpy().and.returnValue('something')
  //     scope.$watch(watchFn)
  //
  //     scope.$digest()
  //
  //     expect(watchFn).toHaveBeenCalled()
  //   })
  //
  //   it('triggers chained watchers in the same digest', function() {
  //
  //     scope.name = 'Xiu'
  //
  //     scope.$watch(
  //       function(scope) { return scope.nameUpper },
  //       function(newVal, oldVal, scope) {
  //         if (newVal) {
  //           scope.initial = newVal.substring(0, 1) + '.'
  //         }
  //       }
  //     )
  //     scope.$watch(
  //       function(scope) { return scope.name },
  //       function(newVal, oldVal, scope) {
  //         if(newVal) {
  //           scope.nameUpper = newVal.toUpperCase()
  //         }
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.initial).toBe('X.')
  //
  //     scope.name = 'Zhu'
  //     scope.$digest()
  //     expect(scope.initial).toBe('Z.')
  //   })
  //
  //   it('give up on the watches after 10 iterations', function() {
  //
  //     scope.counterA = 0
  //     scope.counterB = 0
  //
  //     scope.$watch(
  //       function(scope) { return scope.counterA },
  //       function(newVal, oldVal, scope) {
  //         scope.counterB++
  //       }
  //     )
  //     scope.$watch(
  //       function(scope) { return scope.counterB },
  //       function(newVal, oldVal, scope) {
  //         scope.counterA++
  //       }
  //     )
  //
  //     expect((function() { scope.$digest() })).toThrow()
  //   })
  //
  //   it('ends the digest when the last watch is clean', function() {
  //
  //     scope.array = _.range(100)
  //     let watchExecutions = 0
  //
  //     _.times(100, function(i) {
  //       scope.$watch(
  //         function(scope) {
  //           watchExecutions++
  //           return scope.array[i]
  //         },
  //         function(newVal, oldVal, scope) {
  //
  //         }
  //       )
  //     })
  //
  //     scope.$digest()
  //     expect(watchExecutions).toBe(200)
  //
  //     scope.array[0] = 420
  //     scope.$digest()
  //     expect(watchExecutions).toBe(301)
  //   })
  //
  //   it('does not end digest so that new watches are not run', function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.$watch(
  //           function(scope) { return scope.aValue },
  //           function(newVal, oldValue, scope) {
  //             scope.counter++
  //           }
  //         )
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('compares based on value if enabled', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       },
  //       true
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.aValue.push(4)
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('correctly handles NaNs', function() {
  //
  //     scope.number = 0/0
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) { return scope.number },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('executes $eval`ed function and returns result', function() {
  //
  //     scope.aValue = 42
  //     let result = scope.$eval(function(scope) {
  //       return scope.aValue
  //     })
  //
  //     expect(result).toBe(42)
  //   })
  //
  //   it('passes the second $eval argument straight through', function() {
  //
  //     scope.aValue = 42
  //     let result = scope.$eval(function(scope, arg) {
  //       return scope.aValue + arg
  //     }, 2)
  //
  //     expect(result).toBe(44)
  //   })
  //
  //   it('executes $apply`ed function and startes the digest', function() {
  //
  //     scope.aValue = 'someValue'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() {
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$apply(function(scope) {
  //       scope.aValue = 'someOtherValue'
  //     })
  //
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('executes $evalAsync`ed function later in the same cycle', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.asyncEvaluated = false
  //     scope.asyncEvaluatedImmediately = false
  //
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.$evalAsync(function(scope) {
  //           scope.asyncEvaluated = true
  //         })
  //         scope.asyncEvaluatedImmediately = scope.asyncEvaluated
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.asyncEvaluated).toBe(true)
  //     expect(scope.asyncEvaluatedImmediately).toBe(false)
  //   })
  //
  //   it('executes $evalAsync`ed functions added by watch functions', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.asyncEvaluated = false
  //
  //     scope.$watch(
  //       function(scope) {
  //         if (!scope.asyncEvaluated) {
  //           scope.$evalAsync(function(scope) {
  //             scope.asyncEvaluated = true
  //           })
  //         }
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) { }
  //     )
  //
  //     scope.$digest()
  //
  //     expect(scope.asyncEvaluated).toBe(true)
  //   })
  //
  //   it('executes $evalAsync`ed functions even when not dirty', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.asyncEvaluatedTimes = 0
  //
  //     scope.$watch(
  //       function(scope) {
  //         if (scope.asyncEvaluatedTimes < 2) {
  //           scope.$evalAsync(function(scope) {
  //             scope.asyncEvaluatedTimes++
  //           })
  //         }
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) { }
  //     )
  //
  //     scope.$digest()
  //
  //     expect(scope.asyncEvaluatedTimes).toBe(2)
  //   })
  //
  //   it('eventually halts $evalAsyncs added by watches', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //
  //     scope.$watch(
  //       function(scope) {
  //         scope.$evalAsync(function(scope) { })
  //       },
  //       function(newVal, oldVal, scope) { }
  //     )
  //
  //     expect(function() { scope.$digest() }).toThrow()
  //   })
  //
  //   it('has a $$phase field whose value is the current digest phase', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.phaseInWatchFn = undefined
  //     scope.phaseInListenerFn = undefined
  //     scope.phaseInApplyFn = undefined
  //
  //     scope.$watch(
  //       function(scope) {
  //         scope.phaseInWatchFn = scope.$$phase
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) {
  //         scope.phaseInListenerFn = scope.$$phase
  //       }
  //     )
  //
  //     scope.$apply(function(scope) {
  //       scope.phaseInApplyFn = scope.$$phase
  //     })
  //
  //     expect(scope.phaseInWatchFn).toBe('$digest')
  //     expect(scope.phaseInListenerFn).toBe('$digest')
  //     expect(scope.phaseInApplyFn).toBe('$apply')
  //   })
  //
  //   it('schedules a digest in $evalAsync', function(done) {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$evalAsync(function(scope) {
  //     })
  //
  //     expect(scope.counter).toBe(0)
  //     setTimeout(function() {
  //       expect(scope.counter).toBe(1)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('allows async $apply with $applyAsync', function(done) {
  //
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$applyAsync(function(scope) {
  //       scope.aValue = 'abc'
  //     })
  //     expect(scope.counter).toBe(1)
  //
  //     setTimeout(function() {
  //       expect(scope.counter).toBe(2)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('never executes $applyAsync`ed function in the same cycle', function(done) {
  //
  //     scope.aValue = [1, 2, 3]
  //     scope.asyncApplied = false
  //
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.$applyAsync(function(scope) {
  //           scope.asyncApplied = true
  //         })
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.asyncApplied).toBe(false)
  //     setTimeout(function() {
  //       expect(scope.asyncApplied).toBe(true)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('coalesces many calls to $applyAsync', function(done) {
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) {
  //         scope.counter++
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) { }
  //     )
  //
  //     scope.$applyAsync(function(scope) {
  //       scope.aValue = 'abc'
  //     })
  //
  //     scope.$applyAsync(function(scope) {
  //       scope.aValue = 'def'
  //     })
  //
  //     setTimeout(function() {
  //       expect(scope.counter).toBe(2)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('cancels and flushes $applyAsync if digested first', function(done) {
  //
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) {
  //         scope.counter++
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) { }
  //     )
  //     scope.$applyAsync(function(scope) {
  //       scope.aValue = 'abc'
  //     })
  //     scope.$applyAsync(function(scope) {
  //       scope.aValue = 'def'
  //     })
  //
  //     scope.$digest()
  //
  //     expect(scope.counter).toBe(2)
  //     expect(scope.aValue).toEqual('def')
  //
  //     setTimeout(function() {
  //       expect(scope.counter).toBe(2)
  //       done()
  //     }, 50)
  //
  //   })
  //
  //   it('runs a $$postDigest function after each digest', function() {
  //
  //     scope.counter = 0
  //
  //     scope.$$postDigest(function() {
  //       scope.counter++
  //     })
  //
  //     expect(scope.counter).toBe(0)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('does not include $$postDigest in the digest', function() {
  //
  //     scope.aValue = 'old value'
  //
  //     scope.$$postDigest(function() {
  //       scope.aValue = 'new value'
  //     })
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.watchedValue = newVal
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.watchedValue).toBe('old value')
  //
  //     scope.$digest()
  //     expect(scope.watchedValue).toBe('new value')
  //   })
  //
  //   it('catches exceptions in watch functions and continues', function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) { throw 'error' },
  //       function(newVal, oldVal, scope) { }
  //     )
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('catches exceptions in listener functions and continues', function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         throw 'error'
  //       }
  //     )
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('catches exceptions in $evalAsync', function(done) {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function() { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //     scope.$evalAsync(function(scope) {
  //       throw 'error'
  //     })
  //
  //     setTimeout(function() {
  //       expect(scope.counter).toBe(1)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('catches exceptions in $applyAsync', function(done) {
  //
  //     scope.$applyAsync(function(scope) {
  //       throw 'error'
  //     })
  //     scope.$applyAsync(function(scope) {
  //       throw 'error'
  //     })
  //     scope.$applyAsync(function(scope) {
  //       scope.applied = true
  //     })
  //
  //     setTimeout(function() {
  //       expect(scope.applied).toBe(true)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('catches exceptions in $$postDigest', function() {
  //
  //     let didRun = false
  //
  //     scope.$$postDigest(function() {
  //       throw 'error'
  //     })
  //     scope.$$postDigest(function() {
  //       didRun = true
  //     })
  //
  //     scope.$digest()
  //     expect(didRun).toBe(true)
  //   })
  //
  //   it('allows destroying a $watch with a removal function', function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     let destroyWatch = scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.aValue = 'def'
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.aValue = 'ghi'
  //
  //     destroyWatch()
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('allows destroying a $watch during digest', function() {
  //
  //     scope.aValue = 'abc'
  //
  //     let watchCalls = []
  //
  //     scope.$watch(
  //       function(scope) {
  //         watchCalls.push('1st')
  //       }
  //     )
  //     let destroyWatch = scope.$watch(
  //       function(scope) {
  //         watchCalls.push('2nd')
  //         destroyWatch()
  //       }
  //     )
  //     scope.$watch(
  //       function(scope) {
  //         watchCalls.push('3rd')
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(watchCalls).toEqual(['1st', '2nd', '3rd', '1st', '3rd'])
  //   })
  //
  //   it('allows a $watch to destroy another during digest', function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     scope.$watch(
  //       function(scope) {
  //         return scope.aValue
  //       },
  //       function(newVal, oldVal, scope) {
  //         destroyWatch()
  //       }
  //     )
  //     let destroyWatch = scope.$watch(
  //       function(scope) { },
  //       function(newVal, oldVal, scope) { }
  //     )
  //     scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //           scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('allows destroying multiple watchers during digest',function() {
  //
  //     scope.aValue = 'abc'
  //     scope.counter = 0
  //
  //     let destroyWatch1 = scope.$watch(
  //       function(scope) {
  //         destroyWatch1()
  //         destroyWatch2()
  //       }
  //     )
  //
  //     let destroyWatch2 = scope.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(0)
  //   })
  //
  // })
  //
  // describe('$watchGroup', function() {
  //
  //   var scope
  //   beforeEach(function() {
  //     scope = new Scope
  //   })
  //
  //   it('takes watches as an array and calls listener with arrays', function() {
  //
  //     let gotNewValues, gotOldValues
  //
  //     scope.aValue = 1
  //     scope.anotherValue = 2
  //
  //     scope.$watchGroup([
  //       function(scope) { return scope.aValue },
  //       function(scope) { return scope.anotherValue }
  //     ], function(newVals, oldVals, scope) {
  //       gotNewValues = newVals
  //       gotOldValues = oldVals
  //     })
  //     scope.$digest()
  //
  //     expect(gotNewValues).toEqual([1, 2])
  //     expect(gotOldValues).toEqual([1, 2])
  //   })
  //
  //   it('only calls listener once per digest', function() {
  //
  //     let counter = 0
  //
  //     scope.aValue = 1
  //     scope.anotherValue = 2
  //
  //     scope.$watchGroup([
  //       function(scope) { return scope.aValue },
  //       function(scope) { return scope.anotherValue }
  //     ], function(newVals, oldVals, scope) {
  //       counter++
  //     })
  //
  //     scope.$digest()
  //
  //     expect(counter).toEqual(1)
  //   })
  //
  //   it('uses the same array of old and new values on first run', function() {
  //
  //     let gotNewValues, gotOldValues
  //
  //     scope.aValue = 1
  //     scope.anotherValue = 2
  //
  //     scope.$watchGroup([
  //       function(scope) { return scope.aValue },
  //       function(scope) { return scope.anotherValue }
  //     ], function(newVals, oldVals, scope) {
  //       gotNewValues = newVals
  //       gotOldValues = oldVals
  //     })
  //     scope.$digest()
  //
  //     expect(gotNewValues).toBe(gotOldValues)
  //   })
  //
  //   it('uses different arrays for old and new values on subsequent runs', function() {
  //
  //     let gotNewValues, gotOldValues
  //
  //     scope.aValue = 1
  //     scope.anotherValue = 2
  //
  //     scope.$watchGroup([
  //       function(scope) { return scope.aValue },
  //       function(scope) { return scope.anotherValue }
  //     ], function(newVals, oldVals, scope) {
  //       gotNewValues = newVals
  //       gotOldValues = oldVals
  //     })
  //     scope.$digest()
  //
  //     scope.anotherValue = 3
  //     scope.$digest()
  //
  //     expect(gotNewValues).toEqual([1, 3])
  //     expect(gotOldValues).toEqual([1, 2])
  //   })
  //
  //   it('calls the listener once when the watch array is empty', function() {
  //
  //     let gotNewValues, gotOldValues
  //
  //     scope.$watchGroup([], function(newVals, oldVals, scope) {
  //       gotNewValues = newVals
  //       gotOldValues = oldVals
  //     })
  //     scope.$digest()
  //
  //     expect(gotNewValues).toEqual([])
  //     expect(gotOldValues).toEqual([])
  //   })
  //
  //   it('can be deregistered', function() {
  //
  //     let counter = 0
  //
  //     scope.aValue = 1
  //     scope.anotherValue = 2
  //
  //     let destroyGroup = scope.$watchGroup([
  //       function(scope) { return scope.aValue },
  //       function(scope) { return scope.anotherValue }
  //     ], function(newVals, oldVals, scope) {
  //       counter++
  //     })
  //
  //     scope.$digest()
  //
  //     scope.anotherValue = 3
  //     destroyGroup()
  //     scope.$digest()
  //
  //     expect(counter).toEqual(1)
  //   })
  //
  //   it('does not call the zero-watch listener when deregistered first', function() {
  //
  //     let counter = 0
  //     let destroyGroup = scope.$watchGroup([], function(newVals, oldVals, scope) {
  //       counter++
  //     })
  //     destroyGroup()
  //     scope.$digest()
  //
  //     expect(counter).toEqual(0)
  //   })
  //
  // })
  //
  // describe('Inheritance', function() {
  //
  //   it('inherits the parent`s properties', function() {
  //
  //     let parent = new Scope
  //     parent.aValue = [1, 2, 3]
  //
  //     let child = parent.$new()
  //
  //     expect(child.aValue).toEqual([1, 2, 3])
  //   })
  //
  //   it('does not cause a parent to inherit its properties', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     child.aValue = 'someValue'
  //
  //     expect(parent.aValue).toBeUndefined()
  //   })
  //
  //   it('can manipulate a parent scope`s property', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //     parent.aValue = [1, 2, 3]
  //
  //     child.aValue.push(4)
  //
  //     expect(child.aValue).toEqual([1, 2, 3, 4])
  //     expect(parent.aValue).toEqual([1, 2, 3, 4])
  //   })
  //
  //   it('can watch a property in the parent', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //     parent.aValue = [1, 2, 3]
  //     child.counter = 0
  //
  //     child.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ },
  //       true
  //     )
  //
  //     child.$digest()
  //     expect(child.counter).toBe(1)
  //
  //     parent.aValue.push(4)
  //     child.$digest()
  //     expect(child.counter).toBe(2)
  //   })
  //
  //   it('can be nested at any depth', function() {
  //
  //     let a    = new Scope
  //     let aa   = a.$new()
  //     let aaa  = aa.$new()
  //     let aab  = aa.$new()
  //     let ab   = a.$new()
  //     let abb  = ab.$new()
  //
  //     a.value = 1
  //
  //     expect(aa.value).toBe(1)
  //     expect(aaa.value).toBe(1)
  //     expect(aab.value).toBe(1)
  //     expect(ab.value).toBe(1)
  //     expect(abb.value).toBe(1)
  //
  //     ab.anotherValue = 2
  //
  //     expect(abb.anotherValue).toBe(2)
  //     expect(aa.anotherValue).toBeUndefined()
  //     expect(aaa.anotherValue).toBeUndefined()
  //   })
  //
  //   it('shadows a parent`s property with the same name', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     parent.name = 'Xiu'
  //     child.name = 'Zhu'
  //
  //     expect(parent.name).toBe('Xiu')
  //     expect(child.name).toBe('Zhu')
  //   })
  //
  //   it('does not shadow members of parent scope`s attributes', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     parent.user = { name: 'Xiu' }
  //     child.user.name = 'Zhu'
  //
  //     expect(child.user.name).toBe('Zhu')
  //     expect(parent.user.name).toBe('Zhu')
  //   })
  //
  //   it('does not digest its parent(s)', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     parent.aValue = 'abc'
  //     parent.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.aValueWas = newVal }
  //     )
  //
  //     child.$digest()
  //     expect(child.aValueWas).toBeUndefined()
  //   })
  //
  //   it('keeps a record of its children', function() {
  //
  //     let parent = new Scope
  //     let child1 = parent.$new(),
  //         child2 = parent.$new(),
  //         child2_1 = child2.$new()
  //
  //     expect(parent.$$children.length).toBe(2)
  //     expect(parent.$$children[0]).toBe(child1)
  //     expect(parent.$$children[1]).toBe(child2)
  //
  //     expect(child1.$$children.length).toBe(0)
  //     expect(child2.$$children.length).toBe(1)
  //     expect(child2.$$children[0]).toBe(child2_1)
  //   })
  //
  //   it('digests its children', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     parent.aValue = 'abc'
  //     child.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.aValueWas = newVal }
  //     )
  //
  //     parent.$digest()
  //     expect(child.aValueWas).toBe('abc')
  //   })
  //
  //   it('digests from root on $apply', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(),
  //         child2 = child.$new()
  //
  //     parent.aValue = 'abc'
  //     parent.counter = 0
  //     parent.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     child2.$apply(function() {})
  //
  //     expect(parent.counter).toBe(1)
  //   })
  //
  //   it('schedules a digest from root on $evalAsync', function(done) {
  //
  //     let parent = new Scope
  //     let child = parent.$new(),
  //         child2 = child.$new()
  //
  //     parent.aValue = 'abc'
  //     parent.counter = 0
  //     parent.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     child2.$evalAsync(function() { })
  //
  //     setTimeout(function() {
  //       expect(parent.counter).toBe(1)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('does not have access to parent attributes when isolated', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true)
  //
  //     parent.aValue = 'abc'
  //
  //     expect(child.aValue).toBeUndefined()
  //   })
  //
  //   it('cannot watch parent attributes when isolated', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true)
  //
  //     parent.aValue = 'abc'
  //     child.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldValue, scope) {
  //         scope.aValueWas = newVal
  //       }
  //     )
  //
  //     child.$digest()
  //     expect(child.aValueWas).toBeUndefined()
  //   })
  //
  //   it('digests its isolated children', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true)
  //
  //     child.aValue = 'abc'
  //     child.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.aValueWas = newVal }
  //     )
  //
  //     parent.$digest()
  //     expect(child.aValueWas).toBe('abc')
  //   })
  //
  //   it('digests from root on $apply when isolated', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true),
  //         child2 = child.$new()
  //
  //     parent.aValue = 'abc'
  //     parent.counter = 0
  //     parent.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     child2.$apply(function(scope) { })
  //
  //     expect(parent.counter).toBe(1)
  //   })
  //
  //   it('schedules a digest from root on $evalAsync when isolated', function(done) {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true),
  //         child2 = child.$new()
  //
  //     parent.aValue = 'abc'
  //     parent.counter = 0
  //     parent.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     child2.$evalAsync(function() {})
  //
  //     setTimeout(function() {
  //       expect(parent.counter).toBe(1)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('executes $evalAsync functions on isolated scopes', function(done) {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true)
  //
  //     child.$evalAsync(function(scope) {
  //       scope.didEvalAsync = true
  //     })
  //
  //     setTimeout(function() {
  //       expect(child.didEvalAsync).toBe(true)
  //       done()
  //     }, 50)
  //   })
  //
  //   it('executes $$postDigest functions on isolated scopes', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new(true)
  //
  //     child.$$postDigest(function() {
  //       child.didPostDigest = true
  //     })
  //
  //     parent.$digest()
  //     expect(child.didPostDigest).toBe(true)
  //   })
  //
  //   it('can take some other scope as the parent', function() {
  //
  //     let prototypeParent = new Scope
  //     let hierachyParent = new Scope
  //     let child = prototypeParent.$new(false, hierachyParent)
  //
  //     prototypeParent.a = 23
  //     expect(child.a).toBe(23)
  //
  //     child.counter = 0
  //     child.$watch(function(scope) {
  //       scope.counter++
  //     })
  //
  //     prototypeParent.$digest()
  //     expect(child.counter).toBe(0)
  //
  //     hierachyParent.$digest()
  //     expect(child.counter).toBe(2)
  //   })
  //
  //   it('is no longer digested when $destroy has been called', function() {
  //
  //     let parent = new Scope
  //     let child = parent.$new()
  //
  //     child.aValue = [1, 2, 3]
  //     child.counter = 0
  //     child.$watch(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) { scope.counter++ },
  //       true
  //     )
  //
  //     parent.$digest()
  //     expect(child.counter).toBe(1)
  //
  //     child.aValue.push(4)
  //     parent.$digest()
  //     expect(child.counter).toBe(2)
  //
  //     child.$destroy()
  //     child.aValue.push(5)
  //     parent.$digest()
  //     expect(child.counter).toBe(2)
  //   })
  // })
  //
  // describe('$watchCollection', function() {
  //
  //   let scope
  //
  //   beforeEach(function() {
  //     scope = new Scope
  //   })
  //
  //   it('works like a normal watch for non-collections', function() {
  //
  //     let valueProvided
  //
  //     scope.aValue = 42
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         valueProvided = newVal
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //     expect(valueProvided).toBe(scope.aValue)
  //
  //     scope.aValue = 43
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('works for NaNs', function() {
  //
  //     scope.aValue = 0/0
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('notices when the value becomes an array', function() {
  //
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arr = [1, 2, 3]
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices an item added to an array', function() {
  //
  //     scope.arr = [1, 2, 3]
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arr.push(4)
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices an item removed from an array', function() {
  //
  //     scope.arr = [1, 2, 3]
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arr.shift()
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices an item replaced in an array', function() {
  //
  //     scope.arr = [1, 2, 3]
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arr[0] = 11
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices an array reordered', function() {
  //
  //     scope.arr = [2, 1, 3]
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arr.sort()
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('works for NaN in an array', function() {
  //
  //     scope.arr = [1, NaN, 3]
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arr },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('notices an item replaced in an arguments object', function() {
  //
  //     +function() { scope.arrayLike = arguments } (1, 2, 3)
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arrayLike },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.arrayLike[1] = 4
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices an item replaced in a NodeList object', function() {
  //
  //     document.documentElement.appendChild(document.createElement('div'))
  //     scope.arrayLike = document.getElementsByTagName('div')
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.arrayLike },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     document.documentElement.appendChild(document.createElement('div'))
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices when the value becomes an object', function() {
  //
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.obj = {}
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices when an attribute is added to an object', function() {
  //
  //     scope.counter = 0
  //     scope.obj = { a: 1 }
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.obj.b = 2
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('notices when an attribute is changed in an object', function() {
  //
  //     scope.counter = 0
  //     scope.obj = { a: 1 }
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     scope.obj.a = 2
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('works for NaN attributes in objects', function() {
  //
  //     scope.counter = 0
  //     scope.obj = { a: NaN }
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //   })
  //
  //   it('notices when an attribute is removed in an object', function() {
  //
  //     scope.counter = 0
  //     scope.obj = { a: 1 }
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) { scope.counter++ }
  //     )
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(1)
  //
  //     delete scope.obj.a
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //
  //     scope.$digest()
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('does not consider any object with a length property an array', function() {
  //
  //     scope.obj = { length: 32, other: 'some value' }
  //     scope.counter = 0
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.obj },
  //       function(newVal, oldVal, scope) {
  //         scope.counter++
  //       }
  //     )
  //     scope.$digest()
  //
  //     scope.obj.newKey = 'def'
  //     scope.$digest()
  //
  //     expect(scope.counter).toBe(2)
  //   })
  //
  //   it('gives the old non-collection value to listeners', function() {
  //
  //     scope.aValue = 12
  //     let oldValueGiven
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         oldValueGiven = oldVal
  //       }
  //     )
  //
  //     scope.$digest()
  //
  //     scope.aValue = 123
  //     scope.$digest()
  //
  //     expect(oldValueGiven).toBe(12)
  //   })
  //
  //   it('gives the old array value to listeners', function() {
  //
  //     scope.aValue = [1, 2, 3]
  //     let oldValueGiven
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         oldValueGiven = oldVal
  //       }
  //     )
  //     scope.$digest()
  //
  //     scope.aValue.push(4)
  //     scope.$digest()
  //
  //     expect(oldValueGiven).toEqual([1, 2, 3])
  //   })
  //
  //   it('gives the old object value to listeners', function() {
  //
  //     scope.aValue = { a: 1, b: 2 }
  //     let oldValueGiven
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         oldValueGiven = oldVal
  //       }
  //     )
  //     scope.$digest()
  //
  //     scope.aValue.a = 3
  //     scope.$digest()
  //
  //     expect(oldValueGiven).toEqual({ a: 1, b: 2 })
  //   })
  //
  //   it('uses the new value as the old value on first digest', function() {
  //
  //     scope.aValue = { a: 1, b: 2 }
  //     let oldValueGiven
  //
  //     scope.$watchCollection(
  //       function(scope) { return scope.aValue },
  //       function(newVal, oldVal, scope) {
  //         oldValueGiven = oldVal
  //       }
  //     )
  //     scope.$digest()
  //     expect(oldValueGiven).toEqual({ a: 1, b: 2})
  //   })
  // })
  //
  // describe('Events', function() {
  //
  //   let parent, scope, child, isolatedChild
  //
  //   beforeEach(function() {
  //     parent = new Scope
  //     scope = parent.$new()
  //     child = scope.$new()
  //     isolatedChild = scope.$new(true)
  //   })
  //
  //   it('allows registering listeners', function() {
  //     let listener1 = function() {},
  //         listener2 = function() {},
  //         listener3 = function() {}
  //
  //     scope.$on('someEvent', listener1)
  //     scope.$on('someEvent', listener2)
  //     scope.$on('someOtherEvent', listener3)
  //
  //     expect(scope.$$listeners).toEqual({
  //       someEvent: [listener1, listener2],
  //       someOtherEvent: [listener3]
  //     })
  //   })
  //
  //   _.forEach(['$emit', '$broadcast'], function(method) {
  //
  //     it('calls the listeners of the matching event on ' + method, function() {
  //
  //       let listener1 = jasmine.createSpy()
  //           listener2 = jasmine.createSpy()
  //
  //       scope.$on('someEvent', listener1)
  //       scope.$on('someOtherEvent', listener2)
  //
  //       scope[method]('someEvent')
  //
  //       expect(listener1).toHaveBeenCalled()
  //       expect(listener2).not.toHaveBeenCalled()
  //     })
  //
  //     it('passes an event object with a name to listeners on ' + method, function() {
  //
  //       let listener = jasmine.createSpy()
  //       scope.$on('someEvent', listener)
  //
  //       scope[method]('someEvent')
  //
  //       expect(listener).toHaveBeenCalled()
  //       expect(listener.calls.mostRecent().args[0].name).toEqual('someEvent')
  //     })
  //
  //     it('passes the same event object to each listener on ' + method, function() {
  //
  //       let listener1 = jasmine.createSpy()
  //       let listener2 = jasmine.createSpy()
  //       scope.$on('someEvent', listener1)
  //       scope.$on('someEvent', listener2)
  //
  //       scope[method]('someEvent')
  //
  //       let event1 = listener1.calls.mostRecent().args[0]
  //       let event2 = listener2.calls.mostRecent().args[0]
  //
  //       expect(event1).toBe(event2)
  //     })
  //
  //     it('passes additional arguments to listeners on ' + method, function() {
  //
  //       let listener = jasmine.createSpy()
  //       scope.$on('someEvent', listener)
  //
  //       scope[method]('someEvent', 'and', ['additional', 'arguments'], '...')
  //
  //       expect(listener.calls.mostRecent().args[1]).toEqual('and')
  //       expect(listener.calls.mostRecent().args[2]).toEqual(['additional', 'arguments'])
  //       expect(listener.calls.mostRecent().args[3]).toEqual('...')
  //     })
  //
  //     it('returns the event object on ' + method, function() {
  //
  //       let returnedEvent = scope[method]('someEvent')
  //
  //       expect(returnedEvent).toBeDefined()
  //       expect(returnedEvent.name).toEqual('someEvent')
  //     })
  //
  //     it('can be deregistered ' + method, function() {
  //
  //       let listener = jasmine.createSpy()
  //       let deregister = scope.$on('someEvent', listener)
  //
  //       deregister()
  //
  //       scope[method]('someEvent')
  //
  //       expect(listener).not.toHaveBeenCalled()
  //     })
  //
  //     it('does not skip the next listener when removed on' + method, function() {
  //
  //       let deregister
  //
  //       let listener = function() {
  //         deregister()
  //       }
  //       let nextListener = jasmine.createSpy()
  //
  //       deregister = scope.$on('someEvent', listener)
  //       scope.$on('someEvent', nextListener)
  //
  //       scope[method]('someEvent')
  //
  //       expect(nextListener).toHaveBeenCalled()
  //     })
  //
  //     it('is sets defaultPrevented when preventDefault called on' + method, function() {
  //
  //       let listener = function(event) {
  //         event.preventDefault()
  //       }
  //       scope.$on('someEvent', listener)
  //
  //       let event = scope[method]('someEvent')
  //
  //       expect(event.defaultPrevented).toBe(true)
  //     })
  //
  //     it('does not stop on exceptions on ' + method, function() {
  //
  //       let listener1 = function(event) {
  //         throw 'listener1 throwing an exception'
  //       }
  //       let listener2 = jasmine.createSpy()
  //       scope.$on('someEvent', listener1)
  //       scope.$on('someEvent', listener2)
  //
  //       scope[method]('someEvent')
  //
  //       expect(listener2).toHaveBeenCalled()
  //     })
  //   })
  //
  //   it('propagates up the scope hierarchy on $emit', function() {
  //
  //     let parentListener = jasmine.createSpy()
  //     let scopeListerner = jasmine.createSpy()
  //
  //     parent.$on('someEvent', parentListener)
  //     scope.$on('someEvent', scopeListerner)
  //
  //     scope.$emit('someEvent')
  //
  //     expect(scopeListerner).toHaveBeenCalled()
  //     expect(parentListener).toHaveBeenCalled()
  //   })
  //
  //   it('propagates down the scope hierarchy on $broadcast', function() {
  //
  //     let scopeListener = jasmine.createSpy(),
  //         childListener = jasmine.createSpy(),
  //         isolatedChildListener = jasmine.createSpy()
  //
  //     scope.$on('someEvent', scopeListener)
  //     child.$on('someEvent', childListener)
  //     isolatedChild.$on('someEvent', isolatedChildListener)
  //
  //     scope.$broadcast('someEvent')
  //
  //     expect(scopeListener).toHaveBeenCalled()
  //     expect(childListener).toHaveBeenCalled()
  //     expect(isolatedChildListener).toHaveBeenCalled()
  //
  //   })
  //
  //   it('attaches targetScope on $emit', function() {
  //
  //     let scopeListener = jasmine.createSpy()
  //     let parentListener = jasmine.createSpy()
  //
  //     scope.$on('someEvent', scopeListener)
  //     parent.$on('someEvent', parentListener)
  //
  //     scope.$emit('someEvent')
  //
  //     expect(scopeListener.calls.mostRecent().args[0].targetScope).toBe(scope)
  //     expect(parentListener.calls.mostRecent().args[0].targetScope).toBe(scope)
  //   })
  //
  //   it('attaches targetScope on $broadcast', function() {
  //
  //     let scopeListener = jasmine.createSpy()
  //     let childListener = jasmine.createSpy()
  //
  //     scope.$on('someEvent', scopeListener)
  //     child.$on('someEvent', childListener)
  //
  //     scope.$broadcast('someEvent')
  //
  //     expect(scopeListener.calls.mostRecent().args[0].targetScope).toBe(scope)
  //     expect(childListener.calls.mostRecent().args[0].targetScope).toBe(scope)
  //   })
  //
  //   it('attaches currentScope on $emit', function() {
  //
  //     let currentScopeOnScope, currentScopeOnParent
  //     let scopeListener = function(event) {
  //       currentScopeOnScope = event.currentScope
  //     }
  //     let parentListener = function(event) {
  //       currentScopeOnParent = event.currentScope
  //     }
  //     scope.$on('someEvent', scopeListener)
  //     parent.$on('someEvent', parentListener)
  //
  //     scope.$emit('someEvent')
  //
  //     expect(currentScopeOnScope).toBe(scope)
  //     expect(currentScopeOnParent).toBe(parent)
  //   })
  //
  //   it('attaches currentScope on $broadcast', function() {
  //
  //     let currentScopeOnScope, currentScopeOnChild
  //     let scopeListener = function(event) {
  //       currentScopeOnScope = event.currentScope
  //     }
  //     let childListener = function(event) {
  //       currentScopeOnChild = event.currentScope
  //     }
  //     scope.$on('someEvent', scopeListener)
  //     child.$on('someEvent', childListener)
  //
  //     scope.$broadcast('someEvent')
  //
  //     expect(currentScopeOnScope).toBe(scope)
  //     expect(currentScopeOnChild).toBe(child)
  //   })
  //
  //   it('sets currentScope to null after propagation on $emit', function() {
  //
  //     let event
  //     let scopeListener = function(evt) {
  //       event = evt
  //     }
  //
  //     scope.$on('someEvent', scopeListener)
  //
  //     scope.$emit('someEvent')
  //     expect(event.currentScope).toBe(null)
  //   })
  //
  //   it('sets currentScope to null after propagation on $broadcast', function() {
  //
  //     let event
  //     let scopeListener = function(evt) {
  //       event = evt
  //     }
  //     scope.$on('someEvent', scopeListener)
  //     scope.$broadcast('someEvent')
  //
  //     expect(event.currentScope).toBe(null)
  //   })
  //
  //   it('does not propagate to parents when stopped', function() {
  //
  //     let scopeListener = function(event) {
  //       event.stopPropagation()
  //     }
  //     let parentListener = jasmine.createSpy()
  //
  //     scope.$on('someEvent', scopeListener)
  //     parent.$on('someEvent', parentListener)
  //
  //     scope.$emit('someEvent')
  //
  //     expect(parentListener).not.toHaveBeenCalled()
  //   })
  //
  //   it('is received by listeners on current scope after being stopped', function() {
  //
  //     let listener1 = function(event) {
  //       event.stopPropagation()
  //     }
  //     let listener2 = jasmine.createSpy()
  //
  //     scope.$on('someEvent', listener1)
  //     scope.$on('someEvent', listener2)
  //
  //     scope.$emit('someEvent')
  //
  //     expect(listener2).toHaveBeenCalled()
  //   })
  //
  //   it('fires $destroy when destroyed', function() {
  //
  //     let listener = jasmine.createSpy()
  //     scope.$on('$destroy', listener)
  //
  //     scope.$destroy()
  //
  //     expect(listener).toHaveBeenCalled()
  //   })
  //
  //   it('no longer calls listeners after destroyed', function() {
  //
  //     let listener = jasmine.createSpy()
  //     scope.$on('myEvent', listener)
  //
  //     scope.$destroy()
  //
  //     scope.$emit('myEvent')
  //     expect(listener).not.toHaveBeenCalled()
  //   })
  //
  // })
})













































//eof
