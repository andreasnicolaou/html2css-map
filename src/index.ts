import fg from 'fast-glob';
import fs from 'fs';
import prettier from 'prettier';
import { normalizeStyle, replaceInlineStyles } from './utils';

/**
 * Scans HTML files, extracts inline styles, creates CSS classes, and updates files.
 * @author Andreas Nicolaou
 */
export const runHtml2Css = async (
  inputPath: string,
  outputPath: string,
  dryRun: boolean = false,
  logPath: string = ''
): Promise<void> => {
  const loadingInterval = setInterval(() => process.stdout.write('.'), 500);
  try {
    const files = await fg([`${inputPath}/**/*.html`]);
    clearInterval(loadingInterval);

    if (files.length === 0) {
      console.log('\nℹ️ No HTML files found in the specified directory.');
      return;
    }

    console.log(`\n🔍 Found ${files.length} HTML files in total to process...`);

    const styleMap = new Map<string, string>();
    const fileChangeLog: Map<string, string[]> = new Map();
    let classCounter = 1;

    // Load existing CSS to avoid overwriting
    const existingStyles = readExistingStyles(outputPath);
    for (const [style, className] of existingStyles.entries()) {
      styleMap.set(style, className);
    }

    const usedNumbers = [...existingStyles.values()]
      .map((name) => parseInt(name.replace('html2css-style-', ''), 10))
      .filter((n) => !isNaN(n));
    if (usedNumbers.length > 0) {
      classCounter = Math.max(...usedNumbers) + 1;
    }

    let filesChanged = 0;
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const updated = replaceInlineStyles(content, styleMap, () => `html2css-style-${classCounter++}`);

      if (updated !== content) {
        filesChanged++;
        if (!dryRun) {
          fs.writeFileSync(file, updated, 'utf-8');
        }

        const classNames = Array.from(styleMap.values()).filter(
          (className) => updated.includes(`class="${className}"`) || updated.includes(`class='${className}'`)
        );

        fileChangeLog.set(file, Array.from(new Set(classNames)));
      }
    }

    if (filesChanged === 0) {
      console.log('\n✨ No inline styles found needing conversion.');
      return;
    }

    // Only output new styles
    const newCssEntries = Array.from(styleMap.entries()).filter(([style]) => !existingStyles.has(style));
    if (newCssEntries.length > 0 && !dryRun) {
      let css = newCssEntries
        .map(([style, className]) => {
          const lines = style
            .split(';')
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => `  ${s};`)
            .join('\n');
          return `.${className} {\n${lines}\n}`;
        })
        .join('\n\n');
      css = await formatCSSWithPrettier(css);
      fs.appendFileSync(outputPath, `${css}`, 'utf-8');
      console.log(`\n✅ Appended ${newCssEntries.length} new styles to ${outputPath}.`);
    } else if (dryRun) {
      console.log(`\nℹ️ Dry run: would append ${newCssEntries.length} styles to ${outputPath}.`);
    }

    // Output the log of files that were modified
    if (fileChangeLog.size > 0) {
      console.log(`\n📂 ${dryRun ? 'Files that would be modified' : 'Modified files'}:`);
      for (const [file, classes] of fileChangeLog.entries()) {
        console.log(`- ${file} [${classes.join(', ')}]`);
      }
    }

    // Write the changelog if requested
    if (logPath) {
      const jsonOutput: Record<string, string[]> = {};
      for (const [file, classes] of fileChangeLog.entries()) {
        jsonOutput[file] = classes;
      }
      fs.writeFileSync(logPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
      console.log(`\n📝 Change log written to ${logPath}`);
    }
  } finally {
    clearInterval(loadingInterval);
  }
};

/**
 * Parses an existing CSS file to reuse already generated classes.
 * @author Andreas Nicolaou
 */
const readExistingStyles = (outputPath: string): Map<string, string> => {
  const existingMap = new Map<string, string>();
  if (!fs.existsSync(outputPath)) return existingMap;

  const css = fs.readFileSync(outputPath, 'utf-8');
  const regex = /\.html2css-style-(\d+)\s*\{\s*([^}]+?)\s*\}/g;

  for (const match of css.matchAll(regex)) {
    const className = `html2css-style-${match[1]}`;
    const rawStyle = match[2].trim();
    const normalized = normalizeStyle(
      rawStyle
        .split('\n')
        .map((line) => line.trim().replace(/;$/, ''))
        .join('; ')
    );
    existingMap.set(normalized, className);
  }

  return existingMap;
};

/**
 * Formats CSS using Prettier otherwise falls back to its default.
 * @author Andreas Nicolaou
 */
const formatCSSWithPrettier = async (css: string): Promise<string> => {
  try {
    return await prettier.format(css, {
      parser: 'css',
      tabWidth: 2,
      singleQuote: true,
    });
  } catch {
    console.error('⚠️ CSS formatting failed, writing unformatted CSS');
    return css;
  }
};
