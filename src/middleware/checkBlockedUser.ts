
import type { Request, Response, NextFunction } from "express";

export const checkBlockedUser = (
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

  if (currentUser.isBlocked === true) {
    res.status(403).json({
      success: false,
      message: "Your account has been blocked",
    });
    return;
  }

  next();
};
