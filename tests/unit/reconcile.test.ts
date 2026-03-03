// ReconcileRecurring use case smoke test
// The reconcile logic is integration-tested; here we just verify the module loads correctly

describe('ReconcileRecurring use case', () => {
  it('exports a reconcileRecurring function', async () => {
    const mod = await import('../../src/usecases/ReconcileRecurring');
    expect(typeof mod.reconcileRecurring).toBe('function');
  });
});
