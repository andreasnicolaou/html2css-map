/**
 * Cleans and sorts style rules to ensure consistent comparison.
 * @author Andreas Nicolaou
 */
export const normalizeStyle = (style: string): string => {
  return style
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join('; ');
};

/**
 * Replaces inline styles in HTML with generated CSS class names.
 * @author Andreas Nicolaou
 */
export const replaceInlineStyles = (html: string, styleMap: Map<string, string>, nextClass: () => string): string => {
  const styleRegex = /<([a-z][a-z0-9]*)([^>]*?)\sstyle=(["'])([^"'>]*?\S[^"'>]*?)\3([^>]*)>/gi;

  return html.replace(styleRegex, (_match, tagName, before, _quote, styleContent, after) => {
    const cleaned = styleContent.trim().replace(/\s*;\s*$/, '');
    if (!cleaned) return `<${tagName}${before}${after}>`;

    const normalized = normalizeStyle(cleaned);
    let className = styleMap.get(normalized);
    if (!className) {
      className = nextClass();
      styleMap.set(normalized, className);
    }

    // Handle existing class
    const classMatch = /class=(["'])(.*?)\1/i.exec(before + after);
    let newClassAttr = `class="${className}"`;

    if (classMatch) {
      const existingClasses = classMatch[2].trim();
      if (!existingClasses.split(/\s+/).includes(className)) {
        newClassAttr = `class="${existingClasses} ${className}"`;
      } else {
        newClassAttr = classMatch[0];
      }
      // Remove the old class attribute
      const attrString = before + after;
      const updatedAttrs = attrString.replace(classMatch[0], '').trim();
      return `<${tagName} ${updatedAttrs} ${newClassAttr}>`.replace(/\s+/g, ' ').trim();
    }

    return `<${tagName}${before}${after} ${newClassAttr}>`.replace(/\s+/g, ' ').trim();
  });
};
