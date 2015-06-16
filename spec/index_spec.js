import npmIntegration from 'npm-integration';

describe('npm-integration', function() {
  it('exports "Hello World!"', function() {
    expect(npmIntegration).toBe('Hello World!');
  });
});
