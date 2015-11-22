/* global describe, it, before, after, beforeEach, afterEach, sinon, expect */

var React = require('react')
var _ = require('lodash')
var ReactDOM = require('react-dom')
var testTree = require('../lib/testTree')
var BasicComponent = require('./fixtures/BasicComponent')
var StubbingComponent = require('./fixtures/StubbingComponent')
var MockComponent = require('./fixtures/MockComponent')
var NullComponent = require('./fixtures/NullComponent')
var ContextComponent = require('./fixtures/ContextComponent')
var MountingComponent = require('./fixtures/MountingComponent')
var utils = require('react/lib/ReactTestUtils')

describe('testTree', function () {
  describe('by default', function () {
    var tree
    before(function () {
      sinon.spy(ReactDOM, 'render')
      tree = testTree(<BasicComponent />)
    })
    after(function () {
      tree.dispose()
      ReactDOM.render.restore()
    })

    it('should only render the top-level component', function () {
      expect(ReactDOM.render).to.have.been.calledOnce
    })

    it('should only have dispose method on root node', function () {
      expect(tree.dispose).to.be.a('function')
      expect(tree.get('foo').dispose).to.not.exist
    })

    it('should remove test props from elements', function () {
      expect(tree.get('foo').element.props).to.not.haveOwnProperty('testRef')
      expect(tree.get('boz').element.props).to.not.haveOwnProperty('testRefCollection')
    })

    it('should retain type of children', function () {
      expect(tree.get('foo').getProp('children')).to.be.instanceOf(Array)
      expect(tree.get('bam').getProp('children')).to.be.a('string')
    })
  })

  describe('when the tree updates', function () {
    var tree, foo
    before(function (done) {
      tree = testTree(<MountingComponent />)
      sinon.spy(tree._idManager, 'mapTree')
      foo = tree.get('foo')
      tree.element.setMounted()
      _.defer(done)
    })
    after(function () {
      tree.dispose()
    })

    it('should remap the tree', function () {
      expect(tree._idManager.mapTree).to.have.been.calledOnce
      expect(tree.get('foo')).to.equal(foo)
      expect(tree.get('bar')).to.exist
      expect(tree.get('bar').innerText).to.equal('baz')
    })
  })

  describe('when tree is disposed', function () {
    var tree, spy
    beforeEach(function () {
      spy = sinon.spy(ReactDOM, 'unmountComponentAtNode')
      tree = testTree(<BasicComponent />)
      tree.dispose()
    })
    afterEach(function () {
      spy.restore()
    })

    it('should unmount component', function () {
      expect(tree.isMounted()).to.be.false
      expect(spy).to.have.been.calledOnce
    })
  })

  describe('when tree of null component is disposed', function () {
    var tree
    beforeEach(function () {
      tree = testTree(<NullComponent />)
    })

    it('should unmount successfully', function () {
      var fn = function () {
        tree.dispose()
      }
      expect(fn).to.not.throw
    })
  })

  describe('when wrap is true', function () {
    var tree
    before(function () {
      tree = testTree(
        <div testRef='wrapped'>
          <BasicComponent testRef='inner' />
        </div>,
        { wrap: true }
      )
    })
    after(function () {
      tree.dispose()
    })

    it('should return wrapped tree', function () {
      expect(tree.get('wrapped')).to.exist
      expect(tree.getIn(['inner', 'bam'])).to.exist
    })
  })

  describe('when context is supplied', function () {
    var tree, context
    before(function () {
      context = {
        foo: 'Foos',
        bar: 12345
      }
      tree = testTree(<ContextComponent />, { context: context })
    })
    after(function () {
      tree.dispose()
    })

    it('should pass context through to component', function () {
      expect(tree.element.context).to.deep.equal(context)
    })
  })

  describe('when stubbed', function () {
    var tree
    before(function () {
      var stubTree = {
        foo: <MockComponent />,
        baz: <MockComponent>Bazza</MockComponent>,
        nofoo: null,
        boz: {
          buz: null
        },
        hoc: {
          innerSpan: <MockComponent />
        }
      }
      tree = testTree(<StubbingComponent />, { stub: stubTree })
    })
    after(function () {
      tree.dispose()
    })

    it('should not render anything when stub for ref is null', function () {
      expect(tree.get('nofoo')).to.not.exist
    })

    it('should stub deeply nested refs', function () {
      expect(tree.getIn(['boz', 'fuz'])).to.exist
      expect(tree.getIn(['boz', 'buz'])).to.not.exist
    })

    it('should stub ref with stub element if provided', function () {
      expect(utils.isCompositeComponentWithType(tree.get('foo').element, MockComponent))
      expect(utils.isCompositeComponentWithType(tree.get('baz').element, MockComponent))
    })

    it('should copy props from original onto stub element', function () {
      expect(tree.get('foo').getProp('bar')).to.equal('bar')
      expect(tree.get('foo').key).to.equal('foo')
    })

    it('should pass children to stub element', function () {
      expect(tree.get('foo').getProp('children')).to.equal('Foo')
    })

    it('should use stub element\'s children if available', function () {
      expect(tree.get('baz').getProp('children')).to.equal('Bazza')
    })

    it('should ignore higher order components', function () {
      expect(utils.isCompositeComponentWithType(tree.getIn(['hoc', 'innerSpan']).element, MockComponent)).to.be.true
    })
  })
})
