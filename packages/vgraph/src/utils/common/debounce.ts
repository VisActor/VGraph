const date = Date;
/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * @param {Function} fn - Function to debounce
 * @param {number} wait - time to wait before calling function
 * @param {object} options - The options
 * @param {boolean} options.leading - Specify invoking on the leading edge of the timeout.
 * @param {boolean} options.trailing -  Specify invoking on the trailing edge of the timeout.
 * @param {number} options.maxWait - The maximum time func is allowed to be delayed before it's invoked.
 * @return {Function} - debounced function
 */
export function debounce(
  fn: any,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  }
) {
  const leading = options?.leading ?? false;
  const trailing = options?.trailing ?? true;
  const maxWait = options?.maxWait
    ? Math.max(options?.maxWait, wait)
    : options?.maxWait;
  const maxing = !!options?.maxWait;

  // fn 调用时间戳
  let lastCallTime = 0;
  // debounced 触发时间戳
  let lastInvokeTime = 0;
  let timer: any;
  let args: any;
  let context: any;
  let result: any;

  function shouldInvoke(time: number) {
    if (lastCallTime === 0) {
      return true;
    }
    const callGap = time - lastCallTime;
    const invokeGap = time - lastInvokeTime;
    return callGap >= wait || callGap < 0 || (maxing && invokeGap >= maxWait!);
  }

  function invoke(time: number) {
    lastInvokeTime = time;
    result = fn.apply(context, args);
    args = undefined;
    context = undefined;
    return result;
  }

  // ----- ----
  // -     -
  function leadingEdge(time: number) {
    lastInvokeTime = time;
    // trailing edge timer
    timer = setTimeout(timerFn, wait);
    return leading ? invoke(time) : result;
  }

  // ----     -------
  //       -          -
  function trailingEdge(time: number) {
    timer = undefined;
    if (trailing && args) {
      return invoke(time);
    }
    args = undefined;
    return result;
  }

  function timerFn() {
    const time = date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    const callGap = time - lastCallTime;
    const invokeGap = time - lastInvokeTime;
    const waitGap = wait - callGap;
    const timeout = maxing ? Math.min(waitGap, maxWait! - invokeGap) : waitGap;
    timer = setTimeout(timerFn, timeout);
  }

  function debounced(this: any) {
    const time = date.now();
    const isInvoke = shouldInvoke(time);
    // eslint-disable-next-line prefer-rest-params
    args = arguments;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this;
    lastCallTime = time;
    if (isInvoke) {
      if (timer === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        clearTimeout(timer);
        timer = setTimeout(timerFn, wait);
        return invoke(lastCallTime);
      }
    }
    if (timer === undefined) {
      timer = setTimeout(timerFn, wait);
    }
    return result;
  }

  return debounced;
}
