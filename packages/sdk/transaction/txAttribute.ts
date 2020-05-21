import { ERROR_CODE } from  "../common/error";
import { hex2VarBytes, num2hexstring } from '../common/functionsUtils';
import { StringReader } from '../common/classesUtils'

export enum TransactionAttributeUsage {
  Nonce = 0x00,
  Script = 0x20,
  DescriptionUrl = 0x81,
  Description = 0x90
}

/**
 * @deprecated
 * TransactionAttribute
 * @property {number} usage - Identifying byte
 * @property {string} data - Data
 */
export class TransactionAttribute {
  usage: TransactionAttributeUsage;
  // hexstring
  data: string;

  serialize(): string {
    let result = '';
    result += num2hexstring(this.usage);
    if (this.usage === TransactionAttributeUsage.Script) {
      result += this.data;
    } else if (this.usage === TransactionAttributeUsage.DescriptionUrl
      || this.usage === TransactionAttributeUsage.Description
      || this.usage === TransactionAttributeUsage.Nonce) {
      result += hex2VarBytes(this.data);
    } else {
      throw ERROR_CODE.INVALID_PARAMS;
    }

    return result;
  }

  deserialize(ss: StringReader): void {
    // usage
    const usage = parseInt(ss.read(1), 16);
    // nonce
    // const nonce = ss.read(8);
    // get hash with publicKey;
    const dataLen = ss.readNextLen();
    const data = ss.read(dataLen);
    this.usage = usage;
    // this.nonce = nonce;
    this.data = data;
  }
}