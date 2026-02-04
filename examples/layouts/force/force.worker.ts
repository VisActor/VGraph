import { syncFDP } from '../../../src';

const ctx = self;

ctx.addEventListener('message', (event) => {
  const { data, options } = event.data;
  syncFDP(data, options);
  ctx.postMessage({ data, options });
});