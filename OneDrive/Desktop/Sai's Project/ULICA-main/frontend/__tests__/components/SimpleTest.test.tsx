// Simple test to verify frontend testing setup
describe('Frontend Test Setup', () => {
  it('should have testing environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should be able to perform basic assertions', () => {
    const testValue = 'Hello World';
    expect(testValue).toBe('Hello World');
    expect(testValue).toHaveLength(11);
    expect(testValue).toContain('World');
  });

  it('should handle async operations', async () => {
    const asyncFunction = async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve('async result'), 10);
      });
    };

    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});
