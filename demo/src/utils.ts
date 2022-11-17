export const randomId = () => Math.random().toString(36).slice(-6);

export const array = <T>(length: number, init: T | ((index: number) => T)) => {
  return Array(length)
    .fill(null)
    .map((_, index) => (init instanceof Function ? init(index) : init));
};
