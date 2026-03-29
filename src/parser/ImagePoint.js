class ImagePoint {
  /**
   * Length 2 Uint32Array to store x and y
   */
  #point;

  /**
   *
   * @param {Number[]} point
   */
  constructor(point=[0, 0]) {
    this.#point = new Uint32Array(2);
    // Assign the x and y
    [this.#point[0], this.#point[1]] = [point[0], point[1]];
  }

  /**
   * @returns x value of this point
   */
  get x() {
    return this.#point[0];
  }

  /**
   * @returns y value of this point
   */
  get y() {
    return this.#point[1];
  }

  /**
   * Sets x to value
   * @param {Number} value
   */
  set x(value) {
    this.#point[0] = value;
  }

  /**
   * Sets y to value
   * @param {Number} value
   */
  set y(value) {
    this.#point[1] = value;
  }
}

export default ImagePoint;