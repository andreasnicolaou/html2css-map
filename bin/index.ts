#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { runHtml2Css } from '../src/index';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    demandOption: true,
    describe: 'Path to the folder containing `.html` files to scan.',
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    demandOption: true,
    describe: 'Path to the output CSS file to generate.',
  })
  .option('dry', {
    type: 'boolean',
    default: false,
    describe: 'Preview changes without modifying any files.',
  })
  .option('log', {
    type: 'string',
    default: '',
    describe: 'Optional path to output a JSON changelog file that tracks changes made.',
  })
  .parseSync();

runHtml2Css(argv.input, argv.output, argv.dry, argv.log);
