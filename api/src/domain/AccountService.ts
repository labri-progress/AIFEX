import Token from "./Token";

export default interface AccountService {
    
    signin(username: string, password: string): Promise<Token | "Unauthorized">;


}