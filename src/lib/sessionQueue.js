// Native notification cleanup can outlive the old screen. Do not allow a new
// login to race the old logout and lose its freshly created session.
export function createSessionQueue() {
  let tail = Promise.resolve();
  return {run(operation) {
    const result = tail.then(operation, operation);
    tail = result.catch(() => {});
    return result;
  }};
}
