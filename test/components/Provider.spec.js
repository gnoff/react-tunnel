import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component } from 'react/addons';
import { Provider } from '../../src/index';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('Provider', () => {
    jsdomReact();

    class Child extends Component {
      static contextTypes = {
        provided: PropTypes.object.isRequired
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    class DeepChild extends Component {
      static contextTypes = {
        provided: PropTypes.object.isRequired
      }

      render() {
        return <div>{this.props.children}</div>;
      }
    }

    const obj = {a: 1};
    const fn = () => obj;

    it('should add the `provide` prop to the child context, if plain Object', () => {

      const targetProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const tree = TestUtils.renderIntoDocument(
        <Provider provide={targetProvided}>
          {() => <Child />}
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.provided).toEqual(targetProvided);
      expect(child.context.provided.func()).toBe(obj);
      expect(child.context.provided.object).toBe(obj);
    });

    it('should add the `provide` prop return value to the child context, if function', () => {

      const tree = TestUtils.renderIntoDocument(
        <Provider provide={() => ({any: 'thing'})}>
          {() => <Child />}
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.provided.any).toBe('thing');
    });

    it('should forward parent provided values if nested Provider', () => {

      const forwardingTree = TestUtils.renderIntoDocument(
        <Provider provide={{one: 1}}>
          {() => (
            <Child>
              <Provider provide={{two: 2}}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )

      const deepChild = TestUtils.findRenderedComponentWithType(forwardingTree, DeepChild);
      expect(deepChild.context.provided).toEqual({one: 1, two: 2});

    });

    it('should require `forwardProps` prop if nested', () => {
      const parentProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const nestedProvided = {
        nonOverloaded: "prop",
      }

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider {...nestedProvided}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toThrow(/forwardProvided/);
    });

    it('should require `allowOverload` prop if `forwardProvided` is `true`', () => {
      const parentProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const nestedProvided = {
        nonOverloaded: "prop",
      }

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} {...nestedProvided}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toThrow(/allowOverload/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={false} {...nestedProvided}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toNotThrow();
    });

    it('should forward provided props according to `forwardProvided? {bool}`', () => {
      const parentProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const nestedProvided = {
        nonOverloaded: "prop",
      }

      const forwardingTree = TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={true} {...nestedProvided}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      );

      const deepChild = TestUtils.findRenderedComponentWithType(forwardingTree, DeepChild);
      expect(deepChild.context.provided).toEqual({...parentProvided, ...nestedProvided});
      expect(deepChild.context.provided.forwardProvided).toBe(undefined);
      expect(deepChild.context.provided.string).toBe("a string");
      expect(deepChild.context.provided.nonOverloaded).toBe("prop");
      expect(deepChild.context.provided.func()).toBe(obj);
      expect(deepChild.context.provided.object).toBe(obj);

      const nonForwardingTree = TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={false} {...nestedProvided}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      );

      const deepChildTwo = TestUtils.findRenderedComponentWithType(nonForwardingTree, DeepChild);
      expect(deepChildTwo.context.provided).toEqual({...nestedProvided});
      expect(deepChildTwo.context.provided.forwardProvided).toBe(undefined);
      expect(deepChildTwo.context.provided.string).toBe(undefined);
      expect(deepChildTwo.context.provided.nonOverloaded).toBe("prop");
      expect(deepChildTwo.context.provided.func).toBe(undefined);
      expect(deepChildTwo.context.provided.object).toBe(undefined);

    });

    it('should allow provided overloading according to `allowOverload? {bool}`', () => {
      const parentProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const nestedProvidedOne = {
        nonOverloaded: "prop",
      }

      const nestedProvidedTwo = {
        withOverloaded: "props",
        string: "overloaded string",
      }

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={true} {...nestedProvidedOne}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toNotThrow()

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={false} {...nestedProvidedOne}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toNotThrow()


      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={true} {...nestedProvidedTwo}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toNotThrow()

      expect(() => TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={false} {...nestedProvidedTwo}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      )).toThrow(/allowOverload/)

      const overloadedTree = TestUtils.renderIntoDocument(
        <Provider {...parentProvided}>
          {() => (
            <Child>
              <Provider forwardProvided={true} allowOverload={true} {...nestedProvidedTwo}>
                {() => <DeepChild />}
              </Provider>
            </Child>
          )}
        </Provider>
      );

      const deepChild = TestUtils.findRenderedComponentWithType(overloadedTree, DeepChild);
      expect(deepChild.context.provided).toEqual({...parentProvided, ...nestedProvidedTwo});
      expect(deepChild.context.provided.withOverloaded).toBe("props");
      expect(deepChild.context.provided.string).toBe("overloaded string");
      expect(deepChild.context.provided.func).toBe(fn);
      expect(deepChild.context.provided.object).toBe(obj);

    });
  });
});