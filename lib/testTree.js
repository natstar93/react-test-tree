var React = require("react/addons");
var _ = require("lodash");
var utils = React.addons.TestUtils;
var TestNode = require("./testNode");

function testTree(element, options) {
  options = options || {};

  if (options.stub) {
    wrapRender(element, options.stub);
  }

  var container = document.createElement("div");
  if (options.mount) {
    document.body.appendChild(container);
  }
  element = React.render(element, container);

  var rootNode = new TestNode(element);
  rootNode.dispose = dispose.bind(rootNode, container);

  return rootNode;
}

function dispose(container) {
  if (this.isMounted()) {
    React.unmountComponentAtNode(container);
  }
  if (container.parentElement) {
    container.parentElement.removeChild(container);
  }
}

function wrapRender(element, stubTree) {
  var oldRenderFn = element.type.prototype.render;
  element.type.prototype.render = function () {
    var renderTree = oldRenderFn.apply(this, arguments);
    return stubRenderTree(renderTree, stubTree);
  };
}

function stubRenderTree(renderTree, stubTree) {

  return processNode(renderTree);

  function stubChildren(node) {
    var newProps = node._store.props;
    var oldChildren = newProps.children;

    if (oldChildren instanceof Array) {
      newProps.children = _.map(oldChildren, processNode);
    } else {
      newProps.children = processNode(oldChildren);
    }

    node._store.props = newProps;
    // Update originalProps to prevent mutation warning
    node._store.originalProps = newProps;
    return node;
  }

  function processNode(node) {
    if (!utils.isElement(node)) {
      return node;
    }

    var stub = stubTree[node.ref];
    if (!stub && stub !== undefined) {
      return null;
    }

    if (utils.isElement(stub)) {
      // Merge old and new props onto stub
      var stubProps = _.extend({}, node._store.props, stub._store.props);
      stub._store.props = stubProps;
      stub._store.originalProps = stubProps;
      return React.addons.cloneWithProps(stub, {
        ref: node.ref,
        key: node.key
      });
    }

    // If composite component, wrap it's render method too
    if (typeof stub === "object" &&
      typeof node.type.prototype.render === "function" &&
      typeof node.type.prototype.setState === "function") {
      wrapRender(node, stub);
    }

    return stubChildren(node);
  }
}

module.exports = testTree;