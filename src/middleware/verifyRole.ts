
import type { Request, Response, NextFunction } from "express";

type UserRole = "admin" | "customer";

export const verifyRole = (...allowedRoles: UserRole[]) => {
  return (
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const currentUser = res.locals.currentUser;

    if (!currentUser) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!allowedRoles.includes(currentUser.role)) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource",
      });
      return;
    }

    next();
  };
};
