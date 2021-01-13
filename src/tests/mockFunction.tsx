export function mockFunction(impl = (..._: unknown[]) => { }) {
  const calls = [];
  const mock = (...args: unknown[]) => {
    calls.push(args);
    return impl(...args);
  };
  mock.calls = calls;
  return mock;
}