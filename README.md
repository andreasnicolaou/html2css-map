# html2css-map

**html2css-map** is a command-line tool that extracts inline styles from HTML files, converts them into reusable CSS classes, and rewrites the HTML with cleaner, class-based markup.

## Features

- Scans `.html` files for inline styles
- Generates a css file with reusable classes
- Replaces inline styles with `class=""` attributes
- Deduplicates identical styles
- Dry-run mode to preview changes
- Optional JSON changelog log

## Installation

You can install **html2css-map** as an npm package globally or as a devDependency:

#### Global Installation

```bash
npm install -g html2css-map
```

#### Local Installation (Recommended)

```bash
npm install --save-dev html2css-map
```

## Usage

After installation, you can run the tool via npm scripts or directly through the command line.

**Add the following script to your package.json:**

```json
{
  "scripts": {
    "html2css": "html2css-map --input ./src --output ./custom.css"
  }
}
```

**Run the script:**

```bash
npm run html2css
```

## This will:

- Scan the `./src` folder (change to your current directory)
- Generate a `custom.css` file (change to your preferred name)

### Example

**Before:**

```html
<div style="color: red; font-size: 18px;">Hello</div>
```

**After:**

```html
<div class="html2css-style-1">Hello</div>
```

**custom.css:**

```css
.html2css-style-1 {
  color: red;
  font-size: 18px;
}
```

### Compatibility

- Works with Angular templates (.html files). However, it does not support Angular’s ngStyle directive.
- Works with standard .html files, extracting inline styles and converting them into reusable CSS classes.

### CLI Options

| Option           | Description                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `--input`, `-i`  | (Required) Path to the folder containing `.html` files to scan.             |
| `--output`, `-o` | (Required) Path to the output CSS file to generate.                         |
| `--dry`          | (Optional) If set, it will preview changes without modifying any files.     |
| `--log`          | (Optional) Path to generate a JSON changelog file that tracks changes made. |

## Contributing

Contributions are welcome! If you encounter issues or have ideas to enhance the library, feel free to submit an issue or pull request.
