var React = require("react/addons");
var utils = React.addons.TestUtils;
var TestNode = require("./testNode");

function testTree(element) {
  element = utils.renderIntoDocument(element);

  var rootNode = new TestNode(element);
  rootNode.dispose = dispose;

  return rootNode;

  function dispose() {
    if (this.isMounted()) {
      React.unmountComponentAtNode(this.getDOMNode().parentNode);
    }
  }
}

module.exports = testTree;