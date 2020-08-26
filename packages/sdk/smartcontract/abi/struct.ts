export default class Struct {
  list: any[];

  constructor() {
    this.list = [];
  }
  /**
   * Add arguments to struct.
   * @param args Array of some kinds of value.
   * Boolean, number, string, Address and Struct are supported.
   */
  add(...args: any[]) {
    for (const a of args) {
      this.list.push(a);
    }
  }
}
