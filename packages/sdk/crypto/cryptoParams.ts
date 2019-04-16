export class Curve {
    label: string;
    hex: number;
    preset: string;

    constructor(label: string, hex: number, preset: string) {
        this.label = label;
        this.hex = hex;
        this.preset = preset;

        Curve.values.push(this);
    }
    static values: Curve[] = [];

    static SECP224R1 = new Curve('P-224', 1, 'p224');
    static SECP256R1 = new Curve('P-256', 2, 'p256');
    static SECP384R1 = new Curve('P-384', 3, 'p384');
    static SECP521R1 = new Curve('P-521', 4, 'p521');
    static SM2P256V1 = new Curve('sm2p256v1', 20, 'sm2p256v1');
    static ED25519 = new Curve('ed25519', 25, 'ed25519');

    /**
     * Finds Curvecorresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): Curve {
        const item = Curve.values.find((v) => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Curve corresponding to specified label representation.
     *
     * @param label Label
     */
    static fromLabel(label: string): Curve {
        const item = Curve.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }
}


export class SignatureScheme {
    label: string;
    hex: number;
    labelJWS: string;

    constructor(label: string, hex: number, labelJWS: string) {
        this.label = label;
        this.hex = hex;
        this.labelJWS = labelJWS;
        SignatureScheme.values.push(this);
    }

    static values: SignatureScheme[] = [];

    static ECDSAwithSHA224 = new SignatureScheme('SHA224withECDSA', 0, 'ES224');
    static ECDSAwithSHA256 = new SignatureScheme('SHA256withECDSA', 1, 'ES256');
    static ECDSAwithSHA384 = new SignatureScheme('SHA384withECDSA', 2, 'ES384');
    static ECDSAwithSHA512 = new SignatureScheme('SHA512withECDSA', 3, 'ES512');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_224 = new SignatureScheme('SHA3-224withECDSA', 4, 'ES3-224');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_256 = new SignatureScheme('SHA3-256withECDSA', 5, 'ES3-256');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_384 = new SignatureScheme('SHA3-384withECDSA', 6, 'ES3-384');
    // tslint:disable-next-line:variable-name
    static ECDSAwithSHA3_512 = new SignatureScheme('SHA3-512withECDSA', 7, 'ES3-512');
    static ECDSAwithRIPEMD160 = new SignatureScheme('RIPEMD160withECDSA', 8, 'ER160');
    static SM2withSM3 = new SignatureScheme('SM3withSM2', 9, 'SM');
    static EDDSAwithSHA512 = new SignatureScheme('SHA512withEdDSA', 10, 'EDS512');

    /**
     * Finds Signature schema corresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Signature schema corresponding to specified label representation.
     *
     * @param label Label
     */
    static fromLabel(label: string): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Signature schema corresponding to specified label representation in JWS.
     *
     * @param label Label
     */
    static fromLabelJWS(label: string): SignatureScheme {
        const item = SignatureScheme.values.find((v) => v.labelJWS === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }
}


export class KeyType {
    label: string;
    hex: number;
    defaultSchema: SignatureScheme;

    constructor(label: string, hex: number, defaultSchema: SignatureScheme) {
        this.label = label;
        this.hex = hex;
        this.defaultSchema = defaultSchema;
        KeyType.values.push(this);
    }

    static values: KeyType[] = [];

    static ECDSA = new KeyType('ECDSA', 0x12, SignatureScheme.ECDSAwithSHA256);
    static SM2 = new KeyType('SM2', 0x13, SignatureScheme.SM2withSM3);
    static EDDSA = new KeyType('EDDSA', 0x14, SignatureScheme.EDDSAwithSHA512);

    /**
     * Finds Key type corresponding to specified hex representation.
     *
     * @param hex Byte hex value
     */
    static fromHex(hex: number): KeyType {
        const item = KeyType.values.find((v) => v.hex === hex);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }

    /**
     * Finds Key type corresponding to specified label representation.
     *
     * @param label Label
     */
    static fromLabel(label: string): KeyType {
        const item = KeyType.values.find((v) => v.label === label);
        if (item === undefined) {
            throw new Error('Enum value not found');
        }

        return item;
    }
}

export class KeyParameters {
    curve: Curve;

    constructor(curve: Curve) {
        this.curve = curve;
    }

    /**
     * Create KeyParameters from json.
     * @param json JsonKeyParameters
     */
    static deserializeJson(json: JsonKeyParameters): KeyParameters {
        return new KeyParameters(
            Curve.fromLabel(json.curve)
        );
    }

    /**
     * Serialize KeyParameters to json.
     */
    serializeJson(): JsonKeyParameters {
        return {
            curve: this.curve.label
        };
    }
}

/**
 * Json representation of the Key parameters.
 */
export interface JsonKeyParameters {
    curve: string;
}





