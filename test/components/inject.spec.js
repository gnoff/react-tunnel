import expect from 'expect';
import jsdomReact from './jsdomReact';
import React, { PropTypes, Component, Children} from 'react/addons';
import { inject } from '../../src/index';

const { TestUtils } = React.addons;

describe('React', () => {
  describe('inject', () => {
    jsdomReact();

    class Foil extends Component {
      render() {
        return this.props.children;
      }
    }

    class DeepFoil extends Component {
      render() {
        return this.props.children;
      }
    }

    class Child extends Component {
      static contextTypes = {
        provided: PropTypes.object.isRequired
      }

      render() {
        return <Foil {...this.props}><div>{this.props.children}</div></Foil>;
      }
    }

    class DeepChild extends Component {
      static contextTypes = {
        provided: PropTypes.object.isRequired
      }

      render() {
        return <DeepFoil {...this.props}><div>{this.props.children}</div></DeepFoil>;
      }
    }

    const obj = {a: 1};
    const fn = () => obj;

    class SimpleProvider extends Component {
      static contextTypes = {
        provided: PropTypes.object
      };

      static childContextTypes = {
        provided: PropTypes.object.isRequired
      };

      getChildContext() {
        return { provided: this.state.provided };
      }

      constructor(props, context) {
        super(props, context);
        const { children, ...rest} = props;
        this.state = { provided: {...context.provided, ...rest}};
      }

      componentWillReceiveProps(nextProps, nextContext) {
        const { children, ...rest} = nextProps;
        this.setState({ provided: {...nextContext.provided, ...rest}});
      }

      render() {
        return Children.only(this.props.children);
      }

    }

    it('should add provided props to inject wrapped Component', () => {

      const targetProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      const InjectedChild = inject()(Child);

      const tree = TestUtils.renderIntoDocument(
        <SimpleProvider {...targetProvided}>
          <InjectedChild />
        </SimpleProvider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Foil);
      expect(child.props.string).toBe("a string");
      expect(child.props.number).toBe(1);
      expect(child.props.func).toBe(fn);
      expect(child.props.object).toBe(obj);
    });

    it('should inject return value of `mapProvidedToProps` into wrapped Component', () => {

      const targetProvided = {
        string: "a string",
        number: 1,
        func: fn,
        object: obj,
      }

      function mapProvidedToProps (provided) {
        return {
          newNumber: provided.number + 3,
          longerString: provided.string + ' plus some',
          wrappedFn: () => provided.func,
        }
      }

      const InjectedChild = inject(mapProvidedToProps)(Child);

      const tree = TestUtils.renderIntoDocument(
        <SimpleProvider {...targetProvided}>
          <InjectedChild />
        </SimpleProvider>
      );

      const child = TestUtils.findRenderedComponentWithType(tree, Foil);
      expect(child.props.string).toBe(undefined);
      expect(child.props.number).toBe(undefined);
      expect(child.props.func).toBe(undefined);
      expect(child.props.object).toBe(undefined);
      expect(child.props.newNumber).toBe(4);
      expect(child.props.longerString).toBe('a string plus some');
      expect(child.props.wrappedFn()()).toBe(obj);

    });

    it('should reflect changes in provided values', () => {
      const spy = expect.createSpy(() => ({}));
      function render({ saying }) {
        spy();
        return <div saying={saying} />;
      }

      const InjectedChild = inject()(Child);

      @inject()
      class InjectedContainer extends Component {
        render() {
          return render(this.props);
        }
      }

      class ProviderContainer extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {saying: "hello"};
        }
        render() {
          return (
            <SimpleProvider {...this.state}>
              <InjectedContainer />
            </SimpleProvider>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(<ProviderContainer />);

      const child = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(child.props.saying).toBe('hello');

      tree.setState({saying: 'goodbye'});

      expect(spy.calls.length).toBe(2);
      expect(child.props.saying).toBe('goodbye');

    });

    it('should rerender component if props change even if provided does not.', () => {
      const spy = expect.createSpy(() => ({}));
      function render({ saying, changingProp }) {
        spy();
        return <div saying={saying} changingProp={changingProp} />;
      }

      const InjectedChild = inject()(Child);

      @inject()
      class InjectedContainer extends Component {
        render() {
          return render(this.props);
        }
      }

      class ProviderContainer extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            saying: "hello",
            otherProp: "A",
          };
        }
        render() {
          return (
            <SimpleProvider saying={this.state.saying}>
              <InjectedContainer changingProp={this.state.otherProp} />
            </SimpleProvider>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(<ProviderContainer />);

      const child = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(child.props.saying).toBe('hello');
      expect(child.props.changingProp).toBe('A');

      tree.setState({otherProp: "B"});

      expect(spy.calls.length).toBe(2);
      expect(child.props.saying).toBe('hello');
      expect(child.props.changingProp).toBe('B');

    });

    it('should not rerender if injected props remain the same.', () => {
      const spy = expect.createSpy(() => ({}));
      function render({ otherProp }) {
        spy();
        return <div otherProp={otherProp} />;
      }

      const InjectedChild = inject()(Child);

      @inject(provided => ({otherProp: provided.otherProp}))
      class InjectedContainer extends Component {
        render() {
          return render(this.props);
        }
      }

      class ProviderContainer extends Component {
        constructor(props, context) {
          super(props, context);
          this.state = {
            saying: "hello",
            otherProp: "A",
          };
        }
        render() {
          return (
            <SimpleProvider {...this.state}>
              <InjectedContainer />
            </SimpleProvider>
          );
        }
      }

      const tree = TestUtils.renderIntoDocument(<ProviderContainer />);

      const child = TestUtils.findRenderedDOMComponentWithTag(tree, 'div');
      expect(spy.calls.length).toBe(1);
      expect(child.props.otherProp).toBe('A');

      tree.setState({saying: "goodbye"});

      expect(spy.calls.length).toBe(1);
      expect(child.props.otherProp).toBe('A');

    });
  });
});
