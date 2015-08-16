# react-context-provider
React components and decorators for putting context-like values into context and pulling them out as props

Heavily copied/modeled off the code used in [react-redux](https://github.com/gaearon/react-redux/) by @gaearon 

## Table of Contents

- [Installation](#installation)
- [React Native](#react-native)
- [Quick Start](#quick-start)
- [Best Practices](#bestpractices)
- [API](#api)
  - [`<Provider {...props}>`](#provider-store)
  - [`inject([mapProvidedToProps])`](#connectmapstatetoprops-mapdispatchtoprops-mergeprops)
- [Thanks](#thanks)
- [License](#license)

## Installations

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
        <Provider this="will be provided" andThis="will also be provided">
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
        that: provided.this
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

## API
## Thanks
## License



