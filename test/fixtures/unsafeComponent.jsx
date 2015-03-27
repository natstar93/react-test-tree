var React = require("react");

var UnsafeComponent = React.createClass({
  render: function () {
    return <div ref="element" />;
  }
});

module.exports = UnsafeComponent;