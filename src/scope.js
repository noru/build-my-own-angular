
function Scope() {

  this.$$watchers = []
  this.$$lastDirtyWatch = null
  this.$$asyncQueue = []
  this.$$applyAsyncQueue = []
  this.$$applyAsyncId = null
  this.$$postDigestQueue = []
  this.$root = this
  this.$$children = []
  this.$$phase = null
  this.$$listeners = {}

}

function initWatchVal() {}
Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {

  let self = this
  let watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() { },
    valueEq: !!valueEq,
    last: initWatchVal
  }
  this.$$watchers.unshift(watcher)
  this.$root.$$lastDirtyWatch = null

  return function() {
    let index = self.$$watchers.indexOf(watcher)
    if (index >= 0) {
      self.$$watchers.splice(index, 1)
      self.$root.$$lastDirtyWatch = null
    }
  }
}

Scope.prototype.$$areEqual = function(newVal, oldVal, valueEq) {

  if (valueEq) {
    return _.isEqual(newVal, oldVal)
  } else {
    return newVal === oldVal ||
      (typeof newVal === 'number' && typeof oldVal === 'number' && isNaN(newVal) && isNaN(oldVal))
  }
}

Scope.prototype.$$digestOnce = function() {
  let dirty
  let continueLoop = true
  let self = this

  this.$$everyScope(function(scope) {

    let newVal, oldVal
    _.forEachRight(scope.$$watchers, function(watcher) {

      try {
        if (watcher) {
          newVal = watcher.watchFn(scope)
          oldVal = watcher.last

          if (!scope.$$areEqual(newVal, oldVal, watcher.valueEq)) {
            self.$root.$$lastDirtyWatch = watcher
            watcher.last = (watcher.valueEq ? _.cloneDeep(newVal) : newVal)
            watcher.listenerFn(newVal,
              (oldVal === initWatchVal ? newVal : oldVal),
              scope)
              dirty = true
          } else if (self.$root.$$lastDirtyWatch === watcher) {
            continueLoop = false
            return false
          }
        }
      } catch (e) {
        console.error(e)
      }
    })
    return continueLoop
  })
  return dirty
}

Scope.prototype.$digest = function() {

  let ttl = 10
  let dirty
  this.$root.$$lastDirtyWatch = null
  this.$beginPhase('$digest')

  if (this.$root.$$applyAsyncId) {
    clearTimeout(this.$root.$$applyAsyncId)
    this.$$flushApplyAsync()
  }

  do {
    while (this.$$asyncQueue.length) {
      try {
        let asyncTask = this.$$asyncQueue.shift()
        asyncTask.scope.$eval(asyncTask.expression)
      } catch (e) {
        console.error(e)
      }
    }
    dirty = this.$$digestOnce()
    if ((dirty || this.$$asyncQueue.length) && !(ttl--)) {
      this.$clearPhase()
      throw '10 digest iterations reached'
    }
  } while(dirty || this.$$asyncQueue.length)
  this.$clearPhase()

  while (this.$$postDigestQueue.length) {
    try {
      this.$$postDigestQueue.shift()()
    } catch (e) {
      console.error(e)
    }
  }
}

Scope.prototype.$eval = function(expr, locals) {

  return expr(this, locals)
}

Scope.prototype.$apply = function(expr) {

  try {
    this.$beginPhase('$apply')
    return this.$eval(expr)
  } finally {
    this.$clearPhase()
    this.$root.$digest()
  }
}

Scope.prototype.$evalAsync = function(expr) {

  let self = this
  if (!self.$$phase && !self.$$asyncQueue.length) {
    setTimeout(function() {
      if (self.$$asyncQueue.length) {
        self.$root.$digest()
      }
    }, 0)
  }
  this.$$asyncQueue.push({ scope: this, expression: expr })
}

Scope.prototype.$beginPhase = function(phase) {

  if (this.$$phase) {
    throw this.$$phase + ' already in progress'
  }
  this.$$phase = phase
}

Scope.prototype.$clearPhase = function() {

  this.$$phase = null
}

Scope.prototype.$applyAsync = function(expr) {

  let self = this
  self.$$applyAsyncQueue.push(function() {
    self.$eval(expr)
  })

  if (self.$root.$$applyAsyncId === null) {
    self.$root.$$applyAsyncId = setTimeout(function() {
      self.$apply(_.bind(self.$$flushApplyAsync, self))
    }, 0)
  }
}

Scope.prototype.$$flushApplyAsync = function() {

  while (this.$$applyAsyncQueue.length) {
    try {
      this.$$applyAsyncQueue.shift()()
    } catch (e) {
      console.error(e)
    }
  }
  this.$root.$$applyAsyncId = null
}

Scope.prototype.$$postDigest = function(fn) {
  let ttl = 10
  let dirty
  this.$$postDigestQueue.push(fn)
}

Scope.prototype.$watchGroup = function(watchFns, listenerFn) {

  let self = this
  let newValues = new Array(watchFns.length)
  let oldValues = new Array(watchFns.length)
  let changeReactionScheduled = false
  let firstRun = true

  if (watchFns.length === 0) {
    let shouldCall = true
    self.$evalAsync(function() {
      if (shouldCall) {
        listenerFn(newValues, newValues, self)
      }
    })
    return () => shouldCall = false
  }

  function watchGroupListener() {
    if (firstRun) {
      firstRun = false
      listenerFn(newValues, newValues, self)
    } else {
      listenerFn(newValues, oldValues, self)
    }
    changeReactionScheduled = false
  }
  let destroyFunctions = _.map(watchFns, function(watchFn, i) {
    return self.$watch(watchFn, function(newVal, oldVal) {
      newValues[i] = newVal
      oldValues[i] = oldVal
      if (!changeReactionScheduled) {
        changeReactionScheduled = true
        self.$evalAsync(watchGroupListener)
      }
    })
  })

  return function() {
    _.forEach(destroyFunctions, function(destroy) {
      destroy()
    })
  }
}

Scope.prototype.$new = function(isolated, parent) {
  let child
  parent = parent || this
  if (isolated) {
    child = new Scope
    child.$root = parent.$root
    child.$$asyncQueue = parent.$$asyncQueue
    child.$$postDigestQueue = parent.$$postDigestQueue
    child.$$applyAsyncQueue = parent.$$applyAsyncQueue
  } else {
    let ChildScope = function() { }
    ChildScope.prototype = this
    child = new ChildScope
  }
  parent.$$children.push(child)
  child.$$watchers = []
  child.$$children = []
  child.$$listeners = {}
  child.$parent = parent
  return child
}

Scope.prototype.$$everyScope = function(fn) {

  if (fn(this)) {
    return this.$$children.every(function(child) {
      return child.$$everyScope(fn)
    })
  } else {
    return false
  }
}

Scope.prototype.$destroy = function() {
  this.$broadcast('$destroy')
  if (this.$parent) {
    let siblings = this.$parent.$$children
    let index = siblings.indexOf(this)
    if (index >= 0) {
      siblings.splice(index, 1)
    }
  }
  this.$$watchers = null
  this.$$listeners = {}
}

Scope.prototype.$watchCollection = function(watchFn, listenerFn) {

  let self = this
  let newValue, oldValue, oldLength, veryOldValue, trackVeryOldValue = (listenerFn.length > 1), changeCount = 0
  let firstRun = true

  var internalWatchFn = function(scope) {
    var newLength
    newValue = watchFn(scope)
    if (_.isObject(newValue)) {
      if (_.isArrayLike(newValue)) {
        if (!_.isArray(oldValue)) {
          changeCount++
          oldValue = []
        }
        if (newValue.length !== oldValue.length) {
          changeCount++
          oldValue.length = newValue.length
        }
        _.forEach(newValue, function(newItem, i) {
          var bothNaN = _.isNaN(newItem) && _.isNaN(oldValue[i])
          if (!bothNaN && newItem !== oldValue[i]) {
            changeCount++
            oldValue[i] = newItem
          }
        })
      } else {
        if (!_.isObject(oldValue) || _.isArrayLike(oldValue)) {
          changeCount++
          oldValue = {}
          oldLength = 0
        }
        newLength = 0
        _.forOwn(newValue, function(newVal, key) {
          newLength++
          if (oldValue.hasOwnProperty(key)) {
            var bothNaN = _.isNaN(newVal) && _.isNaN(oldValue[key])
            if (!bothNaN && oldValue[key] !== newVal) {
              changeCount++
              oldValue[key] = newVal
            }
          } else {
            changeCount++
            oldLength++
            oldValue[key] = newVal
          }
        })
        if (oldLength > newLength) {
          changeCount++
          _.forOwn(oldValue, function(oldVal, key) {
            if (!newValue.hasOwnProperty(key)) {
              oldLength--
              delete oldValue[key]
            }
          })
        }
      }
    } else {
      if (!self.$$areEqual(newValue, oldValue, false)) {
        changeCount++
      }
      oldValue = newValue
    }
    return changeCount
  }

  let internalListenerFn = function() {

    if (firstRun) {
      firstRun = false
      listenerFn(newValue, newValue, self)
    } else {
      listenerFn(newValue, veryOldValue, self)
    }
    if (trackVeryOldValue) {
      veryOldValue = _.clone(newValue)
    }
  }

  return this.$watch(internalWatchFn, internalListenerFn)
}

Scope.prototype.$on = function(eventName, listener) {

  let listeners = this.$$listeners[eventName]
  if (!listeners) {
    this.$$listeners[eventName] = listeners = []
  }
  listeners.push(listener)
  return function() {
    let index = listeners.indexOf(listener)
    if (index >= 0) {
      listeners[index] = null
    }
  }
}

Scope.prototype.$emit = function(eventName) {

  let propagationStopped = false
  let event = {
    name: eventName,
    targetScope: this,
    stopPropagation: function() {
      propagationStopped = true
    },
    preventDefault: function() {
      event.defaultPrevented = true
    }
   }
  let listenerArgs = [event].concat(_.tail(arguments))
  let scope = this
  do {
    event.currentScope = scope
    scope.$$fireEventOnScope(eventName, listenerArgs)
    scope = scope.$parent
  } while (scope && !propagationStopped)
  event.currentScope = null
  return event
}

Scope.prototype.$broadcast = function(eventName) {

  let event = {
    name: eventName,
    targetScope: this ,
    preventDefault: function() {
      event.defaultPrevented = true
    }
  }
  let listenerArgs = [event].concat(_.tail(arguments))
  this.$$everyScope(function(scope) {
    event.currentScope = scope
    scope.$$fireEventOnScope(eventName, listenerArgs)
    return true
  })
  event.currentScope = null
  return event
}

Scope.prototype.$$fireEventOnScope = function(eventName, listenerArgs) {

  let listeners = this.$$listeners[eventName] || []
  let i = 0
  while (i < listeners.length) {
    if (listeners[i] === null) {
      listeners.splice(i, 1)
    } else {
      try {
        listeners[i].apply(null, listenerArgs)
      } catch (e) {
        console.error(e)
      }
      i++
    }
  }
}




























//eof
