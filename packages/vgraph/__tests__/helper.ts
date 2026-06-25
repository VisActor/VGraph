// Jest ESM env may not define `global`; alias to globalThis.
(globalThis as any).global = globalThis;
expect.extend({});
