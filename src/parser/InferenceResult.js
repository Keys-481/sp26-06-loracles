import fs from 'node:fs/promises';
import Annotation from './Annotation';

class InferenceResult {
  /**
   * @type Annotation[]
   */
  annotations;
  #filePath;
  #encoding;

  /**
   * Set up the object so annotations can be loaded after init() is called
   * @param {PathLike} filePath file path to read from
   * @param {*} encoding encoding to read with
   */
  constructor(filePath, encoding = 'utf8') {
    this.#filePath = filePath;
    this.#encoding = encoding;
  }


  /**
   * Parses the JSON file this object was constructed with.
   *
   * When finished, results are stored in this.annotations
   *
   * @param {*} callback function to run after file has been read
   */
  async init(callback) {
    const data = await fs.readFile(this.#filePath, {encoding: this.#encoding});

    // Try to parse the JSON file into a JS object
    // throws SyntaxError if its an invalid format for a JSON file
    let json = JSON.parse(data);
    let annots = new Array();
    for (const a of json["annotations"]) {
      // Get the minimum and maximum x and y values for each corner of the square
      const x1 = Math.min(...(a[1][0].map(e => e[0])));
      const y1 = Math.min(...(a[1][0].map(e => e[1])));
      const x2 = Math.max(...(a[1][0].map(e => e[0])));
      const y2 = Math.max(...(a[1][0].map(e => e[1])));

      // Add a new annotation to the list
      annots.push(new Annotation(a[0], [x1, y1], [x2, y2]));
    }

    this.annotations = annots;
    callback.bind(this)();
  }

  /**
   * @returns {string[]} an array with every line in the annotations
   */
  allLines() {
    let lines = [];
    for (let i = 0; i < this.annotations.length; i++) {
      lines.push(this.annotations[i].line);
    }

    return lines;
  }
}

export default InferenceResult;