import * as CryptoJS from 'crypto-js';
import { securityVariables } from './security-variables';

export class AesCriptography {
    private salt: string = securityVariables.salt;
    private keySize: number = securityVariables.keySize;
    private iterations: number = securityVariables.iterations;
    private passPhrase: string = securityVariables.passPhrase;

    encrypt(text: string) {
        const ivc = CryptoJS.enc.Utf8.parse(this.salt);

        const message = (text);
        const saltE = CryptoJS.enc.Utf8.parse(this.salt);

        const key128Bits20Iterations = CryptoJS.PBKDF2(this.passPhrase,
            saltE, {
              keySize: this.keySize / (this.keySize / 4),
              iterations: this.iterations
            });

        const encrypted = CryptoJS.AES.encrypt(message,
            key128Bits20Iterations, {
              keySize: this.keySize / (this.keySize / 4),
              iv: ivc,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
            });
        return encrypted.toString();
      }
}
