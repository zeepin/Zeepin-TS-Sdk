
import { Parameter } from "./parameter";

/**
 * Describes the Abi function
 */
export default class AbiFunction {
  name: string;
  returntype: string;
  parameters: Parameter[];

  constructor(name: string, returntype: string, parameters: Parameter[]) {
    this.name = name;
    this.returntype = returntype;
    this.parameters = parameters;
  }

  getParameter(name: string): any {
    // const p = {} as Parameter;

    for (const v of this.parameters) {
      if (v.getName() === name) {
        return v;
      }
    }
    return null;
  }

  setParamsValue(...args: Parameter[]): void {
    for (let i = 0, len = args.length; i < len; i++) {
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < this.parameters.length; j++) {
        if (args[i].name === this.parameters[j].getName()) {
          this.parameters[j].setValue(args[i]);
        }
      }
    }
    // const parameters = [];
    // for (let i = 0, len = args.length; i < len; i++) {
    //     parameters.push(args[i]);
    // }
    // this.parameters = parameters;
  }

  toString(): string {
    const json = {
      name: this.name,
      returntype: this.returntype,
      parameters: this.parameters
    };

    return JSON.stringify(json);
  }
}
