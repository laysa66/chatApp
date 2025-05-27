import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const SECRET_KEY: Secret = "your-secret-key-here";

export interface CustomRequest extends Request {
  token: string | JwtPayload;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("No token found");

    const decoded = jwt.verify(token, SECRET_KEY);
    (req as CustomRequest).token = decoded;

    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};

// Admin middleware to check if the user has admin role
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new Error("No token found");

    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

    // Check if the user has admin role
    if (!decoded.roles.includes("admin")) {
      return res.status(403).send("Access denied: Admin privileges required");
    }

    (req as CustomRequest).token = decoded;
    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
