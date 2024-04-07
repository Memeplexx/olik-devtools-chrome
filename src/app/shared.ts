export const scrollToUpdatedNode = (selectors: string[]) => {
  setTimeout(() => setTimeout(() => {
    const element = selectors.find(e => document.querySelector(`[data-key-input="${e}"]`));
    element && document.querySelector(`[data-key-input="${element}"]`)?.scrollIntoView({ behavior: 'smooth' });
  }))
}