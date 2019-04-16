import { hex2VarBytes } from "../common/functionsUtils";
import { StringReader } from "../common/classesUtils";

export abstract class Payload {
    abstract serialize(): string;
    abstract deserialize(ss: any): void;
}

export class InvokeCode extends Payload {
    code: string = '';
    constructor() {
        super();
    }

    serialize() {
        let result = '';
        result += hex2VarBytes(this.code);
        return result;
    }

    deserialize(sr: StringReader) {
        // let gasLimit = Fixed64.deserialize(sr);
        // const code = VmCode.deserialize(sr);
        const code = sr.readNextBytes();
        // this.gasLimit = gasLimit;
        this.code = code;
        return this;
    }
}

/**
export class DeployCode {
    code: string;
    needStorage: boolean;
    name: string;
    version: string;
    author: string;
    email: string;
    description: string;

    serialize(): string {
        let result = '';

        // result += this.code.serialize();
        result += hex2VarBytes(this.code);

        result += bool2VarByte(this.needStorage);

        result += str2VarBytes(this.name);

        result += str2VarBytes(this.version);

        result += str2VarBytes(this.author);

        result += str2VarBytes(this.email);

        result += str2VarBytes(this.description);

        return result;
    }


    deserialize(sr: StringReader): void {

        // const code = VmCode.deserialize(sr);
        const code = sr.readNextBytes();
        this.code = code;

        const boolValue = sr.read(1);
        this.needStorage = boolValue === '00' ? false : true;

        const name = sr.readNextBytes();
        this.name = hexstr2str(name);

        const codeVersion = sr.readNextBytes();
        this.version = hexstr2str(codeVersion);

        const author = sr.readNextBytes();
        this.author = hexstr2str(author);

        const email = sr.readNextBytes();
        this.email = hexstr2str(email);

        const description = sr.readNextBytes();
        this.description = hexstr2str(description);
    }
}
*/

