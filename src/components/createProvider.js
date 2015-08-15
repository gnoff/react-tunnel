import invariant from 'invariant';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import hasEmptyIntersection from '../utils/hasEmptyIntersection';
import sharedKeys from '../utils/sharedKeys';

export default function createProvider(React) {
  const { Component, PropTypes } = React;

  return class Provider extends Component {
    static contextTypes = {
      provided: PropTypes.object
    };

    static childContextTypes = {
      provided: PropTypes.object.isRequired
    };

    static propTypes = {
      children: PropTypes.func.isRequired,
      allowOverload: PropTypes.bool,
      forwardProvided: PropTypes.bool,
    };

    getChildContext() {
      return { provided: this.state.provided };
    }

    constructor(props, context) {
      super(props, context);
      const provided = this.providedFromPropsAndContext(props, context);
      this.state = { provided: provided};
    }

    componentWillReceiveProps(nextProps, nextContext) {
      const { provided } = this.state;
      const nextProvided = this.providedFromPropsAndContext(nextProps, nextContext);
      if (shallowEqual(provided, nextProvided)) {
        return;
      }
      this.setState({ provided: nextProvided });
    }

    providedFromPropsAndContext(props, context) {
      const isNestedProvider = isPlainObject(context.provided);
      const parentProvided = isNestedProvider ? context.provided : {};
      const { children, allowOverload, forwardProvided, ...provided} = props;

      if (!isNestedProvider) {
        return provided;
      }

      invariant(
        forwardProvided === true || forwardProvided === false,
        'This Provider appears to be nested inside another provider. `forwardProvided` must be ' +
        'specified (`true` or `false` boolean values only). Instead received %s.',
        forwardProvided
      );

      if (!forwardProvided) {
        return provided;
      } else {
        invariant(
          allowOverload === true || allowOverload === false,
          'This Provider appears to be nested inside another provider and configured to forward ' +
          '`provided` from parent. `allowOverload` must be specified (`true` or `false` boolean ' +
          'values only). Instead received %s.',
          allowOverload
        );
        invariant(
          allowOverload || hasEmptyIntersection(parentProvided, provided),
          'This Provider is configured via `allowOverload` to disallow `provided` overloading but finds its ' +
          '`provided props` conflicts with `provided props` from a parent Provider. the following `provided ' +
          'props` would overload a parent `provided props`: %s.',
          sharedKeys(parentProvided, provided)
        );
        return {...parentProvided, ...provided};
      }
      return provided;
    }

    render() {
      const { children } = this.props;
      return children();
    }
  };
}
