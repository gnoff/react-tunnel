import createProvider from './createProvider';
import createInject from './createInject';

export default function createAll(React) {
  const provide = createProvide(React);
  const inject = createInject(React);

  return { provide, inject };
}