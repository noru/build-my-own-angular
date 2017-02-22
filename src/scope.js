
function Scope() {

  this.$$watchers = []
  this.$$lastDirtyWatch = null
  this.$$asyncQueue = []
  this.$$applyAsyncQueue = []
  this.$$applyAsyncId = null
  this.$$postDigestQueue = []
  this.$$phase = null

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
  this.$$lastDirtyWatch = null

  return function() {
    let index = self.$$watchers.indexOf(watcher)
    if (index >= 0) {
      self.$$watchers.splice(index, 1)
      self.$$lastDirtyWatch = null
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

  let self = this
  let newVal, oldVal, dirty
  _.forEachRight(this.$$watchers, function(watcher) {

    try {
      if (watcher) {
        newVal = watcher.watchFn(self)
        oldVal = watcher.last

        if (!self.$$areEqual(newVal, oldVal, watcher.valueEq)) {
          self.$$lastDirtyWatch = watcher
          watcher.last = (watcher.valueEq ? _.cloneDeep(newVal) : newVal)
          watcher.listenerFn(newVal,
            (oldVal === initWatchVal ? newVal : oldVal),
            self)
            dirty = true
        } else if (self.$$lastDirtyWatch === watcher) {
          return false
        }
      }
    } catch (e) {
      console.error(e)
    }
  })
  return dirty
}

Scope.prototype.$digest = function() {

  let ttl = 10
  let dirty
  this.$$lastDirtyWatch = null
  this.$beginPhase('$digest')

  if (this.$$applyAsyncId) {
    clearTimeout(this.$$applyAsyncId)
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
    this.$digest()
  }
}

Scope.prototype.$evalAsync = function(expr) {

  let self = this
  if (!self.$$phase && !self.$$asyncQueue.length) {
    setTimeout(function() {
      if (self.$$asyncQueue.length) {
        self.$digest()
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

  if (self.$$applyAsyncId === null) {
    self.$$applyAsyncId = setTimeout(function() {
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
  this.$$applyAsyncId = null
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









































//eof
