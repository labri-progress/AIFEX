import Token from "../domain/Token";

declare module 'express-serve-static-core' {
    interface Request {
      token?: Token
    }
  }