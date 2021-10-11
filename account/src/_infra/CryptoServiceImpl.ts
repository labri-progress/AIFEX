import crypto from "crypto";
import util from "util";
import * as sha256 from "fast-sha256";
import CryptoService from "../domain/CryptoService";

const ROUNDS = 2000;
const DKLEN = 128;
const NB_CRYPTO_BYTES = 8;

export default class CryptoServiceImpl implements CryptoService {
    saltAndHashPassword(password: string): { salt: Uint8Array; hash: Uint8Array; } {
        const encoder = new util.TextEncoder();
        const rounds = ROUNDS;
        const salt = crypto.randomBytes(NB_CRYPTO_BYTES);
        const dkLen = DKLEN;
        const hash = sha256.pbkdf2(encoder.encode(password), salt, rounds, dkLen);
        return {
            salt,
            hash
        }
    }
    checkPassword(password: string, salt: Uint8Array, hash: Uint8Array): boolean {
        const encoder = new util.TextEncoder();
        const rounds = ROUNDS;
        const dkLen = DKLEN;
        const computedHash = sha256.pbkdf2(encoder.encode(password), salt, rounds, dkLen);
        if (computedHash.length !== hash.length) {
            return false;
        }
        for (let i = 0; i < computedHash.length; i++) {
            if (computedHash[i] !== hash[i]) {
                return false;
            }
        }
        return true;
    }
}
