export default interface CryptoService {
    saltAndHashPassword(password: string) : {salt: Uint8Array, hash: Uint8Array};
    checkPassword(password: string, salt: Uint8Array, hash: Uint8Array) : boolean;
}