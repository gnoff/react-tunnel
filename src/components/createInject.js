import invariant from 'invariant';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import { object } from 'prop-types';

const defaultMapProvidedToProps = (provided) => ({...provided});

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}

export default function createInject(React) {
  const { Component } = React;

  //@TODO have not tested nextVersion stuff
  var nextVersion = 0;
  return function inject(mapProvidedToProps) {
    const finalMapProvidedToProps = mapProvidedToProps || defaultMapProvidedToProps;

    // Helps track hot reloading.
    const version = nextVersion++;

    function computeProvidedProps(provided) {
      const providedProps = finalMapProvidedToProps(provided);
      invariant(
        isPlainObject(providedProps),
        '`mapProvidedToProps` must return an object. Instead received %s.',
        providedProps
      );
      return providedProps;
    }

    return function wrapWithInject(WrappedComponent) {
      class Inject extends Component {
        static displayName = `inject(${getDisplayName(WrappedComponent)})`;
        static WrappedComponent = WrappedComponent;

        static contextTypes = {
          provided: object
        };

        shouldComponentUpdate(nextProps, nextState, nextContext) {
          return !shallowEqual(this.state.provided, nextState.provided) ||
                  !shallowEqual(this.props, nextProps);
        }

        constructor(props, context) {
          super(props, context);
          this.version = version;
          this.provided = context.provided;

          invariant(this.provided,
            `Could not find "provided" in context ` +
            `of "${this.constructor.displayName}". ` +
            `Wrap a higher component in a <Provider>. `
          );

          this.state = {
            provided: computeProvidedProps(this.provided)
          };
        }

        componentWillReceiveProps(nextProps, nextContext) {
          if (!shallowEqual(this.provided, nextContext.provided)) {
            this.provided = nextContext.provided;
            this.recomputeProvidedProps(nextContext);
          }
        }

        recomputeProvidedProps(context = this.context) {
          const nextProvidedProps = computeProvidedProps(context.provided);
          if (!shallowEqual(nextProvidedProps, this.state.provided)) {
            this.setState({provided: nextProvidedProps});
          }
        }

        getWrappedInstance() {
          return this.refs.wrappedInstance;
        }

        render() {
          return (
            <WrappedComponent ref='wrappedInstance'
                              {...this.state.provided} {...this.props} />
          );
        }
      }

      if ((
        // Node-like CommonJS environments (Browserify, Webpack)
        typeof process !== 'undefined' &&
        typeof process.env !== 'undefined' &&
        process.env.NODE_ENV !== 'production'
       ) ||
        // React Native
        typeof __DEV__ !== 'undefined' &&
        __DEV__ //eslint-disable-line no-undef
      ) {
        Inject.prototype.componentWillUpdate = function componentWillUpdate() {
          if (this.version === version) {
            return;
          }

          // We are hot reloading!
          this.version = version;

          // Update the state and bindings.
          this.recomputeProvidedProps();
        };
      }

      return Inject;
    };
  };
}
