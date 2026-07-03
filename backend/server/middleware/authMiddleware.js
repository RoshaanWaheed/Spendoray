import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

const JWT_SECRET = process.env.JWT_SECRET || 'spendoray_super_secret_jwt_key_2026';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name
      };

      return next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});
