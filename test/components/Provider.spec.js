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
          <Child />
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
          <Child />
        </Provider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Child);
      expect(child.context.provided.any).toBe('thing');
    });

    it('should forward parent provided values if nested Provider', () => {

      const forwardingTree = TestUtils.renderIntoDocument(
        <Provider provide={{one: 1}}>
          <Child>
            <Provider provide={{two: 2}}>
              <DeepChild />
            </Provider>
          </Child>
        </Provider>
      )

      const forwardingTreeWithFn = TestUtils.renderIntoDocument(
        <Provider provide={{one: 1}}>
          <Child>
            <Provider provide={(provided) => ({...provided, two: 2})}>
              <DeepChild />
            </Provider>
          </Child>
        </Provider>
      )

      const forwardingTreeWithFns = TestUtils.renderIntoDocument(
        <Provider provide={() => ({one: 1})}>
          <Child>
            <Provider provide={(provided) => ({...provided, two: 2})}>
              <DeepChild />
            </Provider>
          </Child>
        </Provider>
      )

      const deepChild = TestUtils.findRenderedComponentWithType(forwardingTree, DeepChild);
      expect(deepChild.context.provided).toEqual({one: 1, two: 2});

      const deepChildWithFn = TestUtils.findRenderedComponentWithType(forwardingTreeWithFn, DeepChild);
      expect(deepChildWithFn.context.provided).toEqual({one: 1, two: 2});

      const deepChildWithFns = TestUtils.findRenderedComponentWithType(forwardingTreeWithFns, DeepChild);
      expect(deepChildWithFns.context.provided).toEqual({one: 1, two: 2});

    });

    it('should mask parent provided values if nested Provider with overloaded keys', () => {

      const forwardingTree = TestUtils.renderIntoDocument(
        <Provider provide={{thing: 1, other: 3}}>
          <Child>
            <Provider provide={{thing: 2, andAnother: 4}}>
              <DeepChild />
            </Provider>
          </Child>
        </Provider>
      )

      const deepChild = TestUtils.findRenderedComponentWithType(forwardingTree, DeepChild);
      expect(deepChild.context.provided.thing).toBe(2);
      expect(deepChild.context.provided.other).toBe(3);
      expect(deepChild.context.provided.andAnother).toBe(4);

    });

    it('should require `provide` prop of type object or function', () => {

      expect(() => TestUtils.renderIntoDocument(
        <Provider>
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide="">
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={undefined}>
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={1}>
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={{}}>
          <Child />
        </Provider>
      )).toNotThrow();

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={() => ({})}>
          <Child />
        </Provider>
      )).toNotThrow();

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={() => 1}>
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={() => "test"}>
          <Child />
        </Provider>
      )).toThrow(/provide/);

      expect(() => TestUtils.renderIntoDocument(
        <Provider provide={() => () => ({})}>
          <Child />
        </Provider>
      )).toThrow(/provide/);

    });
  });
});
