var React = require('react')
var ReactDOM = require('react-dom')
var _ = require('lodash')
var testUtils = require('react/lib/ReactTestUtils')
var TestClassNode = require('./TestClassNode')
var constants = require('./constants')
var utils = require('./utils')
var IDManager = require('./IDManager')

function testTree (element, options) {
  options = options || {}

  var rootTestRef = element.props.testRef || constants.ROOT_REF

  var Wrapper = React.createClass({
    childContextTypes: _.mapValues(options.context, function () {
      return React.PropTypes.any
    }),

    getChildContext: function () {
      return options.context
    },

    render: function () {
      return React.cloneElement(element, { testRef: rootTestRef })
    }
  })

  // If wrap option isn't specified, stub should start at the actual
  // provided element, not our wrapped version.
  var stub = options.stub
  if (!options.wrap && stub) {
    stub = {}
    stub[rootTestRef] = options.stub
  }

  var idManager = new IDManager()

  // Always wrap the element in our own component to 'normalise' it.
  // Also allows for injection of context
  var wrappedElement = React.createElement(Wrapper)
  wrapRender(wrappedElement, stub, idManager)

  // Render
  var container = document.createElement('div')
  if (options.mount) {
    document.body.appendChild(container)
  }
  var renderedElement = ReactDOM.render(wrappedElement, container)
  idManager.setTree(renderedElement)
  idManager.mapTree()

  // Set up test tree and add dispose method to root node
  var rootNode = new TestClassNode(renderedElement, idManager)
  if (!options.wrap) {
    rootNode = rootNode.get(rootTestRef)
  }
  rootNode.dispose = dispose.bind(rootNode, container)

  return rootNode
}

function dispose (container) {
  if (this.isMounted()) {
    ReactDOM.unmountComponentAtNode(container)
  }
  if (container.parentElement) {
    container.parentElement.removeChild(container)
  }
}

function wrapRender (element, stubTree, idManager) {
  stubTree = stubTree || {}

  var innerTestRef = _.get(element, 'type.innerTestRef')
  if (innerTestRef) {
    var hocStubTree = {}
    hocStubTree[innerTestRef] = stubTree
    stubTree = hocStubTree
  }

  var store = utils.getTestStore(element)
  store.stubTree = stubTree
  store.idManager = idManager

  var prototype = element.type.prototype
  if (prototype.render !== renderProxy) {
    prototype[constants.OLD_RENDER_FN] = prototype.render
    prototype.render = renderProxy
  }
}

function renderProxy () {
  var store = utils.getTestStore(this)
  var renderTree = this[constants.OLD_RENDER_FN].apply(this, arguments)
  var idManager = store.idManager

  // If idManager doesn't exist, we can assume that render was not called by us and
  // can just return the regular render tree.
  if (!idManager) {
    return renderTree
  }

  var stubTree = store.stubTree || {}
  store.nodeIds = {}
  idManager.mapTreeDeferred()
  return processNode(renderTree)

  function addNodeIds (key, value) {
    store.nodeIds[key] = value
  }

  function processNode (node, index) {
    if (!testUtils.isElement(node)) {
      return node
    }

    var stub = stubTree[node.props.testRef]
    // Replace element with null if stub is defined and falsy
    if (!stub && stub !== undefined) {
      return null
    }

    // Allow elements to be stubbed out with strings
    if (typeof stub === 'string') {
      return stub
    }

    var toClone = node
    var newProps = _.extend({}, node.props)
    var oldChildren = node.props.children

    // If stub is a replacement element, merge it's props
    if (testUtils.isElement(stub)) {
      toClone = stub
      newProps = _.extend(newProps, stub.props)
      if (React.Children.count(stub.props.children) > 0) {
        oldChildren = stub.props.children
      }
    }

    // Set ref and key. If index is provided, set as key
    newProps.ref = node.ref
    if (node.key) {
      newProps.key = node.key
    } else if (index !== undefined) {
      newProps.key = constants.KEY_PREFIX + index
    }

    // Store test props then delete them so we don't propagate them through the tree
    var testRef = newProps.testRef
    var testRefCollection = newProps.testRefCollection
    delete newProps.testRef
    delete newProps.testRefCollection

    // Process children
    var childIds = []
    var newChildren

    var mapChild = function (child, index) {
      var newChild = processNode(child, index)
      var childStore = utils.getTestStore(newChild)
      if (newChild !== child && childStore) {
        childIds.push(childStore.id)
      }
      return newChild
    }

    if (React.isValidElement(oldChildren)) {
      newChildren = mapChild(oldChildren)
    } else if (oldChildren instanceof Array) {
      newChildren = _.map(oldChildren, mapChild)
    } else {
      newChildren = oldChildren
    }

    // Wrap stateless components
    if (utils.isStatelessComponent(toClone)) {
      toClone = wrapStateless(toClone)
    }

    // Create new node and store
    var newNode = React.createElement(toClone.type, newProps, newChildren)
    var newStore = _.extend(utils.getTestStore(newNode), utils.getTestStore(node))

    // Wrap render method of node if it's a composite
    if (utils.isClassComponent(newNode)) {
      wrapRender(newNode, stub, idManager)
    }

    // Ensure node id exists
    if (!newStore.id) {
      newStore.id = idManager.generateId()
    }

    // Add node IDs to containing component
    if (testRef) {
      addNodeIds(testRef, newStore.id)
    }
    if (testRefCollection) {
      addNodeIds(testRefCollection, childIds)
    }

    return newNode
  }
}

function wrapStateless (element) {
  var StatelessWrapper = React.createClass({
    render: function () {
      return element.type(this.props)
    }
  })
  return React.createElement(StatelessWrapper)
}

module.exports = testTree
