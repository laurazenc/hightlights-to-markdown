import { Command } from 'commander';
import getOreillyHighlights from './oreilly-highlights';

const version = '0.0.1';

async function app() {
  const program = new Command();
  program
    .version(version)
    .description('Highlight to markdown CLI')
    .option('-o, --oreilly', 'Generate from oreilly.com')
    .option('-s, --source <path>', 'Source file path')
    .option('-w, --write <path>', 'Write file path')
    .parse(process.argv);

  const options = program.opts();

  const { source, write: output } = options;

  if (options.oreilly) {
    await getOreillyHighlights({ source, output });
  }
}

app();
