import fs from 'node:fs/promises';
import Annotation from './Annotation';

class InferenceResult {
  /**
   * @type Annotation[]
   */
  #annotations;
  #filePath;
  #encoding;
  #imagePath;

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
      let data;

      // Attempt to read from the JSON file
      try {
        data = await fs.readFile(this.#filePath, {encoding: this.#encoding});
      } catch (err) {
        return Promise.reject(err);
      }

      // Try to parse the JSON file into a JS object
      // throws SyntaxError if its an invalid format for a JSON file
      let json;
      try {
        json = JSON.parse(data);
      } catch (err) {
        return Promise.reject(err);
      }

      // Create an annotation object for each annotation in the JSON file
      let annots = [];
      for (const a of json["annotations"]) {
        // Get the minimum and maximum x and y values for each corner of the square
        const x1 = Math.min(...(a[1][0].map(e => e[0])));
        const y1 = Math.min(...(a[1][0].map(e => e[1])));
        const x2 = Math.max(...(a[1][0].map(e => e[0])));
        const y2 = Math.max(...(a[1][0].map(e => e[1])));

        // Add a new annotation to the list
        annots.push(new Annotation(a[0], [x1, y1], [x2, y2]));
      }

      this.#imagePath = json["image_path"] ?? null;
      this.#annotations = annots.sort((a, b) => a.bounds.y1 - b.bounds.y1);
      callback.bind(this)();
  }

  get imagePath() {
    return this.#imagePath;
  }

  /**
   * @returns {string[]} an array with every line in the annotations
   */
  allLines() {
    if (!this.#annotations) {
      throw new Error('InferenceResult must have init() called on it');
    }
    let lines = [];
    for (let i = 0; i < this.#annotations.length; i++) {
      lines.push(this.#annotations[i].line);
    }

    return lines;
  }

  get imagePath() {
    return this.#imagePath;
  }

  get annotations() {
    return this.#annotations;
  }

  toString() {
    if (!this.#annotations) {
      return "bleh";
    }
    return `InferenceResult for ${this.#imagePath}`;
  }
}

export default InferenceResult;