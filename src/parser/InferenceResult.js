import fs from 'node:fs';
import Annotation from './Annotation';


class InferenceResult {
  #annotations;

  constructor(filePath, encoding = 'utf8') {
    let json;

    // Read the contents of the JSON file at filePath with specified encoding
    fs.readFile(filePath, encoding, (err, data) => {
      // There was an error, throw it
      if (err) {
        throw err;
      }

      // Try to parse the JSON file into a JS object
      // throws SyntaxError if its an invalid format for a JSON file
      json = JSON.parse(data);
      this.#annotations = [];
      for (const a of json["annotations"]) {
        this.#annotations.push(new Annotation(a[0], a[1][0], a[1][2]));
      }
    });
  }
}

export default InferenceResult;