var React = require("react");

var StubbingComponent2 = React.createClass({
  render: function () {
    return (
      <div ref="fuz">
        <button ref="buz">Buz</button>
      </div>
    );
  }
});

var StubbingComponent = React.createClass({
  render: function () {
    return (
      <div>
        <div ref="nofoo" />
        <div ref="foo" key="foo" bar="bar">Foo</div>
        <div ref="baz">Baz</div>
        <StubbingComponent2 ref="boz" />
      </div>
    );
  }
});

module.exports = StubbingComponent;