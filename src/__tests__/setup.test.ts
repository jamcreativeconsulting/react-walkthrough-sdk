describe('Test Setup', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have testing-library setup', () => {
    const element = document.createElement('div');
    element.setAttribute('data-testid', 'test-element');
    document.body.appendChild(element);
    expect(element).toBeInTheDocument();
  });
}); 