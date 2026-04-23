/**
 * Class representing Uint32 based coordinates for use with ImageBounds
 */
class ImagePoint {
  /**
   * Length 2 Uint32Array to store x and y
   * @type Uint32Array
   */
  #point;

  /**
   * Create an ImagePoint
   * @param {Number[]} point - Array with x and y coordinates for this point
   */
  constructor(point=[0, 0]) {
    this.#point = new Uint32Array(2);
    // Assign the x and y
    [this.#point[0], this.#point[1]] = [point[0], point[1]];
  }

  /**
   * Gets the x value of this point
   * @returns {Number} x value of this point
   */
  get x() {
    return this.#point[0];
  }

  /**
   * Gets the y value of this point
   * @returns {Number} y value of this point
   */
  get y() {
    return this.#point[1];
  }

  /**
   * Sets x to value
   * @param {Number} value - value to set x to
   */
  set x(value) {
    this.#point[0] = value;
  }

  /**
   * Sets y to value
   * @param {Number} value - value to set y to
   */
  set y(value) {
    this.#point[1] = value;
  }

  /**
   * Get a string representation of the x and y of this ImagePoint
   * @returns {String}
   */
  toString() {
    return `(${this.#point})`;
  }
}

export default ImagePoint;