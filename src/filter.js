const filters = {}

function register(name, factory) {
  if (_.isObject(name)) {
    return _.map(name, (factory, name) => register(name, factory))
  } else {
    let filter = factory()
    filters[name] = filter
    return filter
  }
}

function filter(name) {
  return filters[name]
}
