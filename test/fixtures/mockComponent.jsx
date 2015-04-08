var React = require("react");

var MockComponent = React.createClass({
  render: function () {
    return <div>{this.props.children}</div>;
  }
});

module.exports = MockComponent;