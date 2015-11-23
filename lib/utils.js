var ReactDOM = require('react-dom')
var _ = require('lodash')
var testUtils = require('react/lib/ReactTestUtils')

function getInstanceProperty (instance, prop) {
  var paths = ['', '_reactInternalComponent._currentElement.', '_reactInternalInstance._currentElement.']
  return _.reduce(paths, function (found, path) {
    if (!found) {
      return _.get(instance, path + prop)
    } else {
      return found
    }
  }, null)
}

function getTestStore (instance) {
  var store = getInstanceProperty(instance, '_store')
  if (store) {
    if (!store._rtt) {
      store._rtt = {}
    }
    return store._rtt
  }
}

function isClassInstance (instance) {
  return !!instance._reactInternalInstance
}

function isClassComponent (element) {
  return !!_.get(element, 'type.prototype.render')
}

function isStatelessComponent (element) {
  return typeof element.type === 'function' && !isClassComponent(element)
}

function getDOMNode (element) {
  if (element.getInputNode) { // material-ui
    return element.getInputNode()
  } else if (element.getInputDOMNode) { // react-bootstrap
    return element.getInputDOMNode()
  } else if (isClassInstance(element)) { // regular components
    return ReactDOM.findDOMNode(element)
  } else { // weird non-nodes
    var store = getTestStore(element)
    if (store) {
      var instance = getInstanceProperty(element, '_owner')._instance
      return testUtils.findAllInRenderedTree(instance, function (node) {
        var nodeStore = getTestStore(node)
        return nodeStore.id === store.id
      })[0]
    }
  }
}

module.exports = {
  getInstanceProperty: getInstanceProperty,
  getTestStore: getTestStore,
  isClassInstance: isClassInstance,
  isClassComponent: isClassComponent,
  isStatelessComponent: isStatelessComponent,
  getDOMNode: getDOMNode
}
