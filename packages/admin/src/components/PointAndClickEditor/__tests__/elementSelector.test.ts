import { getElementSelector } from '../elementSelector';

describe('getElementSelector', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="root">
        <button id="test-button">Click me</button>
        <p class="test-paragraph">First paragraph</p>
        <p>Second paragraph</p>
        <p>Third paragraph</p>
      </div>
    `;
  });

  it('returns ID selector when element has ID', () => {
    const button = document.getElementById('test-button');
    expect(button).not.toBeNull();
    if (button) {
      expect(getElementSelector(button as HTMLElement)).toBe('#test-button');
    }
  });

  it('returns class selector when element has classes', () => {
    const paragraph = document.querySelector('.test-paragraph');
    expect(paragraph).not.toBeNull();
    if (paragraph) {
      expect(getElementSelector(paragraph as HTMLElement)).toBe('.test-paragraph');
    }
  });

  it('returns nth-child selector for elements without ID or classes', () => {
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);

    // First paragraph (with class)
    expect(getElementSelector(paragraphs[0] as HTMLElement)).toBe('.test-paragraph');

    // Second paragraph (no class)
    expect(getElementSelector(paragraphs[1] as HTMLElement)).toBe('p:nth-child(3)');

    // Third paragraph (no class)
    expect(getElementSelector(paragraphs[2] as HTMLElement)).toBe('p:nth-child(4)');
  });

  it('returns unique selector for elements with same tag name', () => {
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);

    const selectors = Array.from(paragraphs).map(p => getElementSelector(p as HTMLElement));
    expect(selectors).toEqual(['.test-paragraph', 'p:nth-child(3)', 'p:nth-child(4)']);
  });

  it('returns id selector for elements with id', () => {
    const element = document.createElement('div');
    element.id = 'test-id';
    expect(getElementSelector(element)).toBe('#test-id');
  });

  it('returns class selector for elements with class', () => {
    const element = document.createElement('div');
    element.className = 'test-class';
    expect(getElementSelector(element)).toBe('.test-class');
  });

  it('returns tag selector with nth-child for elements without id or class', () => {
    const parent = document.createElement('div');
    const element = document.createElement('span');
    parent.appendChild(element);
    expect(getElementSelector(element)).toBe('span:nth-child(1)');
  });

  it('returns class selector for elements with class', () => {
    document.body.innerHTML = `
      <div>
        <p class="test-paragraph">Test</p>
      </div>
    `;
    const element = document.querySelector('.test-paragraph') as HTMLElement;
    expect(getElementSelector(element)).toBe('.test-paragraph');
  });

  it('returns nth-child selector for elements without ID or classes', () => {
    document.body.innerHTML = `
      <div>
        <p>First</p>
        <p>Second</p>
        <p>Third</p>
      </div>
    `;
    const paragraphs = document.querySelectorAll('p');

    // First paragraph
    expect(getElementSelector(paragraphs[0] as HTMLElement)).toBe('p:nth-child(1)');

    // Second paragraph
    expect(getElementSelector(paragraphs[1] as HTMLElement)).toBe('p:nth-child(2)');

    // Third paragraph
    expect(getElementSelector(paragraphs[2] as HTMLElement)).toBe('p:nth-child(3)');
  });

  it('returns unique selector for elements with same tag name', () => {
    document.body.innerHTML = `
      <div>
        <p class="test-paragraph">First</p>
        <p>Second</p>
        <p>Third</p>
        <p>Fourth</p>
      </div>
    `;
    const paragraphs = document.querySelectorAll('p');
    const selectors = Array.from(paragraphs).map(p => getElementSelector(p as HTMLElement));
    expect(selectors).toEqual([
      '.test-paragraph',
      'p:nth-child(2)',
      'p:nth-child(3)',
      'p:nth-child(4)',
    ]);
  });

  it('returns id selector for elements with id', () => {
    document.body.innerHTML = `
      <p id="test-id">Test</p>
    `;
    const element = document.querySelector('#test-id') as HTMLElement;
    expect(getElementSelector(element)).toBe('#test-id');
  });

  it('prefers id selector over class selector', () => {
    document.body.innerHTML = `
      <p id="test-id" class="test-class">Test</p>
    `;
    const element = document.querySelector('#test-id') as HTMLElement;
    expect(getElementSelector(element)).toBe('#test-id');
  });

  it('prefers class selector over nth-child selector', () => {
    document.body.innerHTML = `
      <div>
        <p>First</p>
        <p class="test-class">Second</p>
        <p>Third</p>
      </div>
    `;
    const element = document.querySelector('.test-class') as HTMLElement;
    expect(getElementSelector(element)).toBe('.test-class');
  });
});
