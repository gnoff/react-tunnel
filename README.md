# react-tunnel
React components and decorators for putting context-like values into context and pulling them out as props

Heavily copied/modeled off the code used in [react-redux](https://github.com/gaearon/react-redux/) by @gaearon 

## Table of Contents

- [Installation](#installation)
- [React Native](#react-native)
- [Quick Start](#quick-start)
- [Best Practices](#bestpractices)
- [API](#api)
  - [`<Provider provide>`](#provider-provide)
  - [`inject([mapProvidedToProps])`](#injectmapprovidedtoprops)
- [Thanks](#thanks)
- [License](#license)

## installation

`npm install --save react-tunnel`.  

## React Native

for React: require/import from `react-tunnel`.  
For React Native: require/import from `react-tunnel/native`.

## Quick Start

`react-tunnel` helps you provide injectable props to child components to help avoid deep chains of prop passing

- install with `npm install react-tunnel`
- import or require `Provider` and `inject` by
```js

//es5
var Provider = require('react-tunnel').Provider;
var inject = require('react-tunnel').inject;

//es6
import { Provider, inject } from 'react-tunnel'

```

- wrap a `Component` tree with `<Provider provide={fn|object}>` like
```js
//using object provide
render() {
    return (
        <Provider provide={{thing: "one", anotherThing: 2}}>
            {(function () {
                return <Anything>
            })}
        </Provider>
    )
}

//or as a function
function provider () {
  return {
    thing: "one",
    anotherThing: 2g
  }
}

render() {
    return (
        <Provider provide={provider}>
            {(function () {
                return <Anything>
            })}
        </Provider>
    )
}
```

- decorate a child component with `inject` and provide a mapping function determine which provided props to inject into the decorated component
```js
var SomeChild = require('./SomeChildOfAnything') //a react Component

function mapProvidedToProps(provided) {
    return {
        that: provided.thing
    }
}

//notice that inject returns a wrapping function
var InjectedChild = inject(mapProvidedToProps)(SomeChild); 

// now in InjectedChild props will have `that`
...
render() {
    var injectedProp = this.props.that;
    return <span>{injectedProp}</span>;
    //will render as <span>one</span>
}
```

## Best Practices

`react-tunnel` uses React's context feature to make provided props available to children regardless of how deep they are. While this is powerful it also can be abused and make for a nightmare to manage.

It is reccommended that this functionality be used to provide generally static properties that don't change much if at all based on the local conditions of the injecting component. Examples might include

- Providing viewport dimensions to arbitrarily deep Components
- Providing (redux)[https://github.com/rackt/redux] action creators from a parent `connected` Component to deep children

Also please consider that the context api for React has PropType checking for a reason and that by using this library and opting out of that stronger contract has costs and you may want to utilize the base context features rather than this library

## API

### `<Provider provide>`

makes `provide` available via `context.provided` to children of Provider. use `inject` to access them easily

#### Props

- `provide {fn | object}`:
  - `provide: function(parentProvided) { return provided<object> }`: will provide the return value of `provide` prop. Function takes in any provided values from parent providers if any. If none, an empty object is passed.
  - `provide: object`: provides any parent provided values if nested along with `provide` object properties. if there is a key collision the properties of the `provide` prop are used and mask similarly named properties from any parent provided objects

#### Children

until React 0.14 is realeased and the changes to parent context are implemented the only child `Provider` can have is a function. It should return what you want rendered inside the provider.

#### Nesting

`Provider`s are nestable and if using the object version of `provide` will automatically reprovide any values provided in the immediate parent `Provider`. Use this if you want to say Provide some truly global props at the root of your App but also use `Provider`s for (Redux action creators)[https://github.com/gaearon/react-redux] produced via `connect` to the local render tree.

If you nest `Provider`s but use the function form of `provide` you will need to forward any desired parent provided values using the function forms argument `parentProvided`.

### `inject([mapProvidedToProps])`

Creates a decorator which injects props from `Provider` into the decorated component according to the `mapProvidedToProps` function. 

#### Arguments

- `mapProvidedToProps(provided)? returns Object`: called when decorated Component mounts and when it receives new context. the return object of this call is added to the underlying Component as props
- `default`: if `mapProvidedToProps` is not passed to `inject` then all `Provider` values are passed to underlying component.


## Thanks
- [@gaearon](https://github.com/gaearon) for inspiring this API with the more specialized [react-redux](https://github.com/gaearon/react-redux)
- [@rt2zz](https://www.github.com/rt2zz) for helping flesh out the design and API

## License

MIT



