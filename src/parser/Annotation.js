import ImageBounds from './ImageBounds';

/**
 * Class representing a line of text bounded by a rectangle
 */
class Annotation {
  /**
   * @type {String}
   */
  #line;
  /**
   * @type {ImageBounds}
   */
  #bounds;

  /**
   * Create an annotation
   *
   * nw and se can be TypedArrays or Arrays of numbers
   *
   * @param {String} line - Line of text
   * @param {Number[]|Uint32Array} nw - x and y of top left corner of bounding rectangle
   * @param {Number[]|Uint32Array} se - x and y of bottom right corner of bounding rectangle
   */
  constructor(line, nw, se) {
    [this.#line, this.#bounds] = [line, new ImageBounds(nw, se)];
  }

  /**
   * Get the line
   * @return {String} the line
   */
  get line() {
    return this.#line;
  }

  /**
   * Get the bounding box
   * @return {ImageBounds} the bounding box
   */
  get bounds() {
    return this.#bounds;
  }

  /**
   * Set the line
   * @param {String} value - new value to set the line to
   */
  set line(value) {
    this.#line = value;
  }

  /**
   * Set the bounds
   * @param {ImageBounds} value - new value to set the bounds to
   */
  set bounds(value) {
    this.#bounds = value;
  }

  /**
   * Get a string representation of the bounds and line of this annotation
   * @returns {String}
   */
  toString() {
    return `${this.#bounds}: ${this.#line}`;
  }
}

export default Annotation;