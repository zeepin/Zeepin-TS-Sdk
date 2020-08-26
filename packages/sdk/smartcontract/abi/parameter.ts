export enum ParameterType {
  Boolean = 'Boolean',
  Integer = 'Integer',
  ByteArray = 'ByteArray',
  Interface = 'Interface',
  Array = 'Array',
  Struct = 'Struct',
  Map = 'Map',
  String = 'String',
  Int = 'Integer',
  Long = 'Long', // value should be string
  IntArray = 'IntArray',
  LongArray = 'LongArray',
  Address = 'Address'
}

export enum ParameterTypeVal {
  ByteArray = 0x00,
  Boolean = 0x01,
  Integer = 0x02,
  Interface = 0x40,
  Array = 0x80,
  Struct = 0x81,
  Map = 0x82
}

/**
 * Decribes the parameter.
 */
export class Parameter {
  public name: string;
  public type: ParameterType;
  public value: any;
  constructor(name: string, type: ParameterType, value: any) {
    this.name = name;
    this.type = type;
    this.value = value;
  }

  getName(): string {
    return this.name;
  }

  getType(): ParameterType {
    return this.type;
  }

  getValue(): any {
    return this.value;
  }

  setValue(value: any): boolean {
    if (value.type === this.type && value.name === this.name && value.value != null) {
      this.value = value.value;
      return true;
    }
    return false;
  }
}
