var React = require("react");

var BasicComponent = React.createClass({
  getInitialState: function () {
    return {
      foo: "bar"
    };
  },
  render: function () {
    return (
      <div {...this.props} ref="foo" className="Foo">
        <ul refCollection="bar">
          <li>1</li>
          <li>2</li>
        </ul>
        <input ref="baz" defaultValue="Baz" />
      </div>
    );
  }
});

module.exports = BasicComponent;