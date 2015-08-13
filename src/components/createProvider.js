import invariant from 'invariant';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';

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
      const { children, allowOverload, forwardProvided, ...remainingProps} = props;
      invariant(
        !isNestedProvider || allowOverload === true || allowOverload === false,
        'This Provider appears to be nested inside another provider. `allowOverload` ' + 
        'must be specified (`true` or `false` boolean values only). Instead received %s.',
        allowOverload
      );
      let provided = remainingProps
      if ( forwardProvided !== false ) {
        provided = {...context.provided, ...provided};
      }
      return provided;
    }

    render() {
      const { children } = this.props;
      return children();
    }
  };
}