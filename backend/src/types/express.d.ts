import { TokenPayload } from "./index";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
