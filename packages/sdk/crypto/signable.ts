/**
 * Interface for other classes to implement, which should be signable.
 */
export interface Signable {
    /**
     * Get the sign content of object
     */
    getSignContent(): string;

    /**
     * Gets the raw serialized content of signable object without hashing
     */
    serializeUnsignedData(): string;
}
