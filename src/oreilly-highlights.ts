import { parseFile } from '@fast-csv/parse';
import * as fs from 'fs';
import path from 'path';

const defaultSourcePath = 'oreilly-annotations.csv';
const defaultOutputPath = 'output';

type Books = {
  [title: string]: {
    [chapter: string]: { text: string; note: string }[];
  };
};

const getOreillyHighlights = async ({
  source,
  output
}: {
  source: string;
  output: string;
}) => {
  const sourcePath = source || defaultSourcePath;
  const outputPath = output || defaultOutputPath;
  const books = await readSourceCSV(sourcePath);
  const markdownBooks = booksToMd(books);
  generateMarkdownFiles(books, markdownBooks, outputPath);
};

const readSourceCSV = (sourcePath: string): Promise<Books> => {
  const books: Books = {};
  return new Promise((resolve, reject) => {
    parseFile(sourcePath, { ignoreEmpty: true, headers: true })
      .on('error', (error) => {
        console.error(error);
        reject();
      })
      .on('data', (row) => {
        const bookTitle = row['Book Title'];
        const chapterTitle = row['Chapter Title'];
        const highlight = row['Highlight'];
        const note = row['Personal Note'];

        if (!books[bookTitle]) {
          books[bookTitle] = {};
        }

        if (!books[bookTitle][chapterTitle]) {
          books[bookTitle][chapterTitle] = [];
        }

        books[bookTitle][chapterTitle].push({ text: highlight, note });
      })
      .on('end', () => {
        console.log('Books extracted from CSV!');
        resolve(books);
      });
  });
};

function booksToMd(books: Books) {
  const bookTitles = Object.keys(books);
  console.log('Transforming to markdown...');
  return bookTitles.map((bookTitle) => {
    const chapters = Object.keys(books[bookTitle]);

    const chaptersMd = chapters
      .map((chapterTitle) => {
        const highlights = books[bookTitle][chapterTitle];

        const highlightsMd = highlights
          .map(({ text, note }) => {
            return `> ${text}\n\n${note}\n`;
          })
          .join('');

        return `## ${chapterTitle}\n\n${highlightsMd}`;
      })
      .join('');

    return `# ${bookTitle}\n\n${chaptersMd}`;
  });
}

function generateMarkdownFiles(
  books: Books,
  markdownBooks: string[],
  outputPath: string
) {
  Object.keys(books).forEach((title, index) => {
    const bookTitle = `${title
      .replace('&#58;', '')
      .replace(/\W+/g, '-')
      .toLowerCase()}.md`;

    const outputFile = path.join(outputPath, bookTitle);

    console.log(outputFile);
    validateFileExists(outputFile);
    fs.writeFileSync(outputFile, markdownBooks[index]);
  });
}

function validateFileExists(filePath: string): void {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  validateFileExists(dirname);
  fs.mkdirSync(dirname);
}

export default getOreillyHighlights;
