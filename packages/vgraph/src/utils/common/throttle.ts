import { debounce } from "./debounce";

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds.
 * @param {Function} fn - Function to throttle
 * @param {number} wait - The number of milliseconds to throttle invocations to
 * @param {object} options - The options
 * @param {boolean} options.leading - Specify invoking on the leading edge of the timeout.
 * @param {boolean} options.trailing -  Specify invoking on the trailing edge of the timeout.
 * @return {Function} - throttled function
 */
export function throttle(
  func: any,
  wait: number,
  options?: {
    leading?: boolean;
    trailing?: boolean;
  }
) {
  return debounce(func, wait, {
    leading: options?.leading ?? true,
    trailing: options?.trailing ?? true,
    maxWait: wait,
  });
}
