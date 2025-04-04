import { getElementSelector } from '../PointAndClickEditor';

describe('getElementSelector', () => {
  it('generates selector for element with ID', () => {
    const element = document.createElement('div');
    element.id = 'test-id';

    const selector = getElementSelector(element);
    expect(selector).toBe('div#test-id');
  });

  it('generates selector for element with class', () => {
    const element = document.createElement('div');
    element.className = 'test-class';

    const selector = getElementSelector(element);
    expect(selector).toBe('div.test-class');
  });

  it('generates selector for element with multiple classes', () => {
    const element = document.createElement('div');
    element.className = 'test-class1 test-class2';

    const selector = getElementSelector(element);
    expect(selector).toBe('div.test-class1.test-class2');
  });

  it('generates selector for element with data attribute', () => {
    const element = document.createElement('div');
    element.setAttribute('data-test', 'test-value');

    const selector = getElementSelector(element);
    expect(selector).toBe('div[data-test="test-value"]');
  });

  it('generates selector for element with nth-child', () => {
    const parent = document.createElement('div');
    const element = document.createElement('div');
    parent.appendChild(element);

    const selector = getElementSelector(element);
    expect(selector).toBe('div > div:nth-child(1)');
  });

  it('generates nested selector for child element', () => {
    const parent = document.createElement('div');
    parent.id = 'parent';
    const child = document.createElement('span');
    child.id = 'child';
    parent.appendChild(child);

    const selector = getElementSelector(child);
    expect(selector).toBe('div#parent > span#child');
  });

  it('handles complex nested structure', () => {
    const container = document.createElement('div');
    container.id = 'container';

    const parent = document.createElement('div');
    parent.className = 'parent';

    const child = document.createElement('span');
    child.setAttribute('data-test', 'value');

    container.appendChild(parent);
    parent.appendChild(child);

    const selector = getElementSelector(child);
    expect(selector).toBe('div#container > div.parent > span[data-test="value"]');
  });

  it('handles elements with no unique identifiers', () => {
    const parent = document.createElement('div');
    const child1 = document.createElement('div');
    const child2 = document.createElement('div');
    parent.appendChild(child1);
    parent.appendChild(child2);

    const selector = getElementSelector(child2);
    expect(selector).toBe('div > div:nth-child(2)');
  });

  it('stops at body element', () => {
    const element = document.createElement('div');
    element.id = 'test';
    document.body.appendChild(element);

    const selector = getElementSelector(element);
    expect(selector).toBe('div#test');
  });
});
