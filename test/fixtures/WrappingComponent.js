var React = require('react')

var InnerComponent = React.createClass({
  propTypes: {
    children: React.PropTypes.any
  },

  render: function () {
    return this.props.children
  }
})

var WrappingComponent = React.createClass({
  render: function () {
    return (
      <InnerComponent>
        <div ref='foo' />
      </InnerComponent>
    )
  }
})

module.exports = WrappingComponent
