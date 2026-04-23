import ImagePoint from './ImagePoint';

/**
 * Class representing the Bounds of an image. Uses two ImagePoints for the top and bottom corner
 */
class ImageBounds {
  /**
   * Top left corner
   * @type ImagePoint
   */
  #northWest;
  /**
   * Bottom right corner
   * @type ImagePoint
   */
  #southEast;

  /**
   * Create a new ImageBounds
   *
   * nw and se can be TypedArrays or Arrays of numbers
   *
   * @param {Number[]} nw - Northwest corner point, where nw[0] is x and nw[1] is y
   * @param {Number[]} se - Southeast corner point, where se[0] is x and se[1] is y
   */
  constructor(nw, se) {
    this.#northWest = new ImagePoint(nw);
    this.#southEast = new ImagePoint(se);
  }

  /**
   * Gets x value of the northwest corner
   * @returns {Number} x value of the northwest corner
   */
  get x1() {
    return this.#northWest.x;
  }

  /**
   * Gets y value of the northwest corner
   * @returns {Number} y value of the northwest corner
   */
  get y1() {
    return this.#northWest.y;
  }

  /**
   * Gets x value of the southeast corner
   * @returns {Number} x value of the southeast corner
   */
  get x2() {
    return this.#southEast.x;
  }

  /**
   * Gets y value of the southeast corner
   * @returns {Number} y value of the southeast corner
   */
  get y2() {
    return this.#southEast.y;
  }

  /**
   * Sets x value of the northwest corner
   * @param {Number} value - Value to set x of northwest corner to
   */
  set x1(value) {
    this.#northWest.x = value;
  }

  /**
   * Sets y value of the northwest corner
   * @param {Number} value - Value to set y of northwest corner to
   */
  set y1(value) {
    this.#northWest.y = value;
  }

  /**
   * Sets x value of the southeast corner
   * @param {Number} value - Value to set x of southeast corner to
   */
  set x2(value) {
    this.#southEast.x = value;
  }

  /**
   * Sets y value of the southeast corner
   * @param {Number} value - Value to set y of southeast corner to
   */
  set y2(value) {
    this.#southEast.y = value;
  }

  /**
   * Get a string representation of the northwest to southeast corners of this ImageBounds
   * @returns {String}
   */
  toString() {
    return `(${this.#northWest} -> ${this.#southEast})`;
  }
}

export default ImageBounds;