# react-context-provider
React components and decorators for putting context-like values into context and pulling them out as props

Heavily copied/modeled off the code used in [react-redux](https://github.com/gaearon/react-redux/) by @gaearon 

## Table of Contents

- [Installation](#installation)
- [React Native](#react-native)
- [Quick Start](#quick-start)
- [Best Practices](#bestpractices)
- [API](#api)
  - [`<Provider {...props}>`](#provider-forwardprovided-allowoverload-propstoprovide)
  - [`inject([mapProvidedToProps])`](#injectmapprovidedtoprops)
- [Thanks](#thanks)
- [License](#license)

## installation

`npm install --save react-context-provider`.  

## React Native

for React: require/import from `react-context-provider`.  
For React Native: require/import from `react-context-provider/native`.

## Quick Start

`react-context-provider` helps you provide injectable props to child components to help avoid deep chains of prop passing

- install with `npm install react-context-provider`
- import or require `Provider` and `inject` by
```js

//es5
var Provider = require('react-context-provider').Provider;
var inject = require('react-context-provider').inject;

//es6
import { Provider, inject } from 'react-context-provider'

```

- wrap a `Component` tree with `<Provider {...propsToProvide}` like
```js
render() {
    return (
        <Provider thing="will be provided" anotherThing="will also be provided">
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
    //will render as <span>will be provided</span>
}
```

## Best Practices

`react-context-provider` uses React's context feature to make provided props available to children regardless of how deep they are. While this is powerful it also can be abused and make for a nightmare to manage.

It is reccommended that this functionality be used to provide generally static properties that don't change much if at all based on the local conditions of the injecting component. Examples might include

- Providing viewport dimensions to arbitrarily deep Components
- Providing (redux)[https://github.com/rackt/redux] action creators from a parent `connected` Component to deep children

Also please consider that the context api for React has PropType checking for a reason and that by using this library and opting out of that stronger contract has costs and you may want to utilize the base context features rather than this library

## API

### `<Provider [forwardProvided] [allowOverload] {...propsToProvide}>`

makes `...propsToProvide` available via `context.provided` to children of Provider. use `inject` to access them easily

#### Props

- `forwardProvided? {bool}`: required if this <Provider> is nested within another one in the render tree.
  - `true`: will put parent 'context.provided' properties on it's own 'context.provided'
  - `false`: parent 'context.provided' values will become unavailable to children of this 'Provider'
- `allowOverload? {bool}`: required if this '<Provider>' nested within another and is configured to 'forwardProvided'
  - `true`: local provided props will mask forwared provided props if they share the same name
  - `false`: throws an error if a local provided prop has a name collision with a parent provided prop
- `{...propsToProvide}`: any other prop that you pass to Provider will be made `inject`able

#### Children

until React 0.14 is realeased and the changes to parent context are implemented the only child `Provider` can have is a function. It should return what you want rendered inside the provider.

#### Nesting

`Providers` are nestable and if configured affirmatively will forward provided values for parent `Providers`. Use this if you want to say Provide some truly global props at the root of your App but also use `Provider`s for (Redux action creators)[https://github.com/gaearon/react-redux] produced via `connect` to the local render tree

### `inject([mapProvidedToProps])`

Creates a decorator which injects props from `Provider` into the decorated component according to the `mapProvidedToProps` function. 

#### Arguments

- `mapProvidedToProps(provided)? returns Object`: called when decorated Component mounts and when it receives new context. the return object of this call is added to the underlying Component as props
- `default`: if `mapProvidedToProps` is not passed to g`inject` then all `Provider` values are passed to underlying component.


## Thanks
- [@gaearon](https://github.com/gaearon) for inspiring this API with the more specialized [react-redux](https://github.com/gaearon/react-redux)
- [@rt2zz](https://www.github.com/rt2zz) for helping flesh out the design and API

## License

MIT



