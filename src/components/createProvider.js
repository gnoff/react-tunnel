import invariant from 'invariant';
import shallowEqual from '../utils/shallowEqual';
import isPlainObject from '../utils/isPlainObject';
import hasEmptyIntersection from '../utils/hasEmptyIntersection';
import sharedKeys from '../utils/sharedKeys';

export default function createProvider(React) {
  const { Component, PropTypes, Children } = React;

  return class Provider extends Component {
    static contextTypes = {
      provided: PropTypes.object
    };

    static childContextTypes = {
      provided: PropTypes.object.isRequired
    };

    static propTypes = {
      children: PropTypes.element.isRequired,
      provide: PropTypes.oneOfType([
                  PropTypes.object,
                  PropTypes.func,
                ]),
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

      if (isNestedProvider) {
        invariant(
          isPlainObject(parentProvided),
          'This Provider appears to be nested inside another provider but received a parent `provided` ' + 
          'is not a plain Object. `provided` must be always be a plain Object. %s',
          parentProvided
        );  
      } 


      const { provide } = props;
      let provider = provide;

      if (isPlainObject(provide)) {
        provider = (parentProvided) => ({...parentProvided, ...provide})
      }

      let provided = provider(parentProvided);

      invariant(
        isPlainObject(provided),
        'This Provider is attempting to provide something other than a plain Object. ' + 
        'the `provide` prop must either be a plain object itself or a function that returns ' +
        'a plain Object. `provide` is or returned %s',
        provided
      ); 

      return provided;
    }

    isNested() {

    }

    render() {
      return Children.only(this.props.children);
    }
  };
}
