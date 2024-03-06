/**
 * @typedef {import("./interfaces.d.ts").FlamethrowerOptions} FlamethrowerOptions
 * @typedef {import("./interfaces.d.ts").FlameWindow} FlameWindow
 */
import { Router } from './router.js';

/**
 * @type {(opts?: FlamethrowerOptions) => Router}
 * starts flamethrower router and returns instance
 * can be accessed globally with window.flamethrower
 */
export default (opts) => {
  const router = new Router(opts);
  // eslint-disable-next-line no-console
  opts.log && console.log('🔥 flamethrower engaged');
  if (window) {
    const flame = /**@type {FlameWindow}*/(window);
    flame.flamethrower = router;
  }
  return router;
};
