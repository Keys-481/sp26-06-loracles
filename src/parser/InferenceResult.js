import fs from 'node:fs/promises';
import Annotation from './Annotation';

/**
 * A class representing an inference result, containing annotations
 *
 * This is used to parse the JSON files created by the inference models.
 *
 * Be sure to use init() to run the parser.
 */
class InferenceResult {
  /**
   * The annotations this stores.
   * @type {?Annotation[]}
   */
  #annotations;
  /**
   * @type {!Pathlike}
   */
  #filePath;
  /**
   * @type {?String}
   */
  #encoding;
  /**
   * @type {?String}
   */
  #imagePath;

  /**
   * Create a new InferenceResult with setup variables
   * @param {PathLike} filePath file path to read JSON from
   * @param {String} [encoding='utf8'] encoding to read with
   */
  constructor(filePath, encoding='utf8') {
    this.#filePath = filePath;
    this.#encoding = encoding;
  }


  /**
   * Parses the JSON file this object was constructed with.
   *
   * When finished, results are stored in this.#annotations
   * and image path is saved in this.#imagePath.
   *
   * Resolves on success, rejects on error
   * @returns {Promise<InferenceResult>}
   */
  async init() {
    return new Promise(async (resolve, reject) => {
      let data;

      // Attempt to read from the JSON file
      try {
        data = await fs.readFile(this.#filePath, {encoding: this.#encoding});
      } catch (err) {
        return reject(err);
      }

      // Try to parse the JSON file into a JS object
      // throws SyntaxError if its an invalid format for a JSON file
      let json;
      try {
        json = JSON.parse(data);
      } catch (err) {
        reject(err);
      }

      // Create an annotation object for each annotation in the JSON file
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

      this.#imagePath = json["image_path"] ?? "";
      this.#annotations = annots;
      resolve(this);
    });
  }

  /**
   * Gets an array containing all of the lines in the annotations
   * @returns {String[]} an array with every line in the annotations
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

  /**
   * Gets the imagePath
   * @returns {?String} the imagePath
   */
  get imagePath() {
    return this.#imagePath;
  }

  /**
   * Gets the annotations array
   * @returns {?Annotation[]} the annotations array
   */
  get annotations() {
    return this.#annotations;
  }

  /**
   * Returns a string noting that this is the inference result for the specified image path
   * @returns {String} a string noting that this is the inference result for the specified image path
   */
  toString() {
    if (!this.#annotations) {
      return "Uninitialized InferenceResult";
    }
    return `InferenceResult for ${this.#imagePath}`;
  }
}

export default InferenceResult;