var React = require('react')

var NestedComponent2 = React.createClass({
  render: function () {
    return (
      <div testRef='ref2'>
        <ul testRefCollection='refCollection2'>
          <li>1</li>
          <li>2</li>
        </ul>
      </div>
    )
  }
})

var NestedComponent = React.createClass({
  render: function () {
    return (
      <div testRef='ref1' ref='foo' key='foo'>
        <ul testRefCollection='refCollection1'>
          <li>1</li>
          <li>2</li>
        </ul>
        <NestedComponent2 testRef='nested' ref='bar' key='bar' />
      </div>
    )
  }
})

module.exports = NestedComponent
