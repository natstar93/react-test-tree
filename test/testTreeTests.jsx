var React = require("react/addons");
var expect = require("chai").expect;
var sinon = require("sinon");
var testTree = require("../lib/testTree");
var BasicComponent = require("./fixtures/basicComponent.jsx");
var StubbingComponent = require("./fixtures/stubbingComponent.jsx");
var MockComponent = require("./fixtures/mockComponent.jsx");
var utils = React.addons.TestUtils;

describe("testTree", function () {

  describe("by default", function () {
    var tree;
    before(function () {
      sinon.spy(utils, "renderIntoDocument");
      tree = testTree(<BasicComponent />);
    });
    after(function () {
      tree.dispose();
      utils.renderIntoDocument.restore();
    });

    it("should only render the top-level component", function () {
      expect(utils.renderIntoDocument).to.have.been.calledOnce;
    });

    it("should only have dispose method on root node", function () {
      expect(tree.dispose).to.be.a("function");
      expect(tree.foo.dispose).to.not.exist;
    });

  });

  describe("when tree is disposed", function () {
    var tree, spy;
    beforeEach(function () {
      spy = sinon.spy(React, "unmountComponentAtNode");
      tree = testTree(<BasicComponent />);
    });
    afterEach(function () {
      tree.dispose();
      spy.restore();
    });

    it("should unmount component", function () {
      tree.dispose();
      expect(tree.isMounted()).to.be.false;
      expect(spy).to.have.been.calledOnce;
    });
  });

  describe("when stubbed", function () {
    var tree;
    before(function () {
      var stubTree = {
        foo: <MockComponent />,
        baz: <MockComponent>Bazza</MockComponent>,
        nofoo: null,
        boz: {
          buz: null
        }
      };
      tree = testTree(<StubbingComponent />, { stub: stubTree });
    });
    after(function () {
      tree.dispose();
    });

    it("should not render anything when stub for ref is null", function () {
      expect(tree.nofoo).to.not.exist;
    });

    it("should stub deeply nested refs", function () {
      expect(tree.boz.fuz).to.exist;
      expect(tree.boz.buz).to.not.exist;
    });

    it("should stub ref with stub element if provided", function () {
      expect(utils.isCompositeComponentWithType(tree.foo.element, MockComponent));
      expect(utils.isCompositeComponentWithType(tree.baz.element, MockComponent));
    });

    it("should copy props from original onto stub element", function () {
      expect(tree.foo.getProp("bar")).to.equal("bar");
      expect(tree.foo.key).to.equal("foo");
    });

    it("should pass children to stub element", function () {
      expect(tree.foo.getProp("children")).to.equal("Foo");
    });

    it("should use stub element's children if available", function () {
      expect(tree.baz.getProp("children")).to.equal("Bazza");
    });

  });

});