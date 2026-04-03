import ImagePoint from './ImagePoint';

/**
 * Bounds of an image. Uses two ImagePoints for the top and bottom corner
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
   * Construct a new ImageBounds with the specified northwest and southeast corners.
   *
   * nw and se can be Arrays of numbers or TypedArrays
   *
   * @param {number[]} nw Northwest corner point, where nw[0] is x and nw[1] is y
   * @param {number[]} se Southeast corner point, where se[0] is x and se[1] is y
   */
  constructor(nw, se) {
    this.#northWest = new ImagePoint(nw);
    this.#southEast = new ImagePoint(se);
  }

  /**
   * @returns x value of the northwest corner
   */
  get x1() {
    return this.#northWest.x;
  }

  /**
   * @returns y value of the northwest corner
   */
  get y1() {
    return this.#northWest.y;
  }

  /**
   * @returns x value of the southeast corner
   */
  get x2() {
    return this.#southEast.x;
  }

  /**
   * @returns y value of the southeast corner
   */
  get y2() {
    return this.#southEast.y;
  }

  /**
   * Sets x value of the northwest corner
   */
  set x1(value) {
    this.#northWest.x = value;
  }

  /**
   * Sets y value of the northwest corner
   */
  set y1(value) {
    this.#northWest.y = value;
  }

  /**
   * Sets x value of the southeast corner
   */
  set x2(value) {
    this.#southEast.x = value;
  }

  /**
   * Sets y value of the southeast corner
   */
  set y2(value) {
    this.#southEast.y = value;
  }

  toString() {
    return `(${this.#northWest} -> ${this.#southEast})`;
  }
}

export default ImageBounds;