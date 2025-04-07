export const getElementSelector = (element: HTMLElement): string => {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.className) {
    return `.${element.className.split(' ').join('.')}`;
  }

  const parent = element.parentElement;
  if (!parent) {
    return element.tagName.toLowerCase();
  }

  const siblings = Array.from(parent.children);
  const index = siblings.indexOf(element) + 1;
  return `${element.tagName.toLowerCase()}:nth-child(${index})`;
};
