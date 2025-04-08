import { normalizeStyle, replaceInlineStyles } from './utils';

describe('normalizeStyle', () => {
  test('normalizeStyle handles different formatting', () => {
    expect(normalizeStyle('color:red; font-size:12px')).toBe('color:red; font-size:12px');
    expect(normalizeStyle('font-size:12px;color:red')).toBe('color:red; font-size:12px');
    expect(normalizeStyle('  color:red  ;  ')).toBe('color:red');
  });
});

describe('replaceInlineStyles', () => {
  const styleMap = new Map();
  const nextClass = (): string => 'style-1';

  test('Basic conversion', () => {
    expect(replaceInlineStyles('<div style="color:red">Test</div>', styleMap, nextClass)).toBe(
      '<div class="style-1">Test</div>'
    );
  });
  test('Preserves existing classes', () => {
    expect(replaceInlineStyles('<div class="existing" style="color:red">Test</div>', styleMap, nextClass)).toBe(
      '<div class="existing style-1">Test</div>'
    );
  });

  test('Ignores teststyle', () => {
    expect(replaceInlineStyles('<div teststyle="row" style="color:red">Test</div>', styleMap, nextClass)).toBe(
      '<div teststyle="row" class="style-1">Test</div>'
    );
  });
});
