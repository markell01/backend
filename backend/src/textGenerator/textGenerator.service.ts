import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TextGeneratorService {
  async textGenerator() {
    const filePath = join(process.cwd(), 'public', 'text.txt');

    const text = (await readFile(filePath, 'utf8'))
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const words: string[] = [];
    const wordLimit = this.getWordLimit();

    while (words.length < wordLimit) {
      words.push(text[this.getRandomInt(text.length)]);
    }

    return words.join(' ');
  }

  private getWordLimit() {
    const limit = Number(process.env.WORD_LIMIT);

    if (!Number.isFinite(limit) || limit <= 0) {
      return 300;
    }

    return limit;
  }

  private getRandomInt(length: number) {
    return Math.floor(Math.random() * length);
  }
}
