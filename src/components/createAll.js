import createProvider from './createProvider';
import createInject from './createInject';

export default function createAll(React) {
  const Provider = createProvider(React);
  const inject = createInject(React);

  return { Provider, inject };
}