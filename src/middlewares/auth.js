import 'dotenv/config';
import  prisma  from '../libs/prisma.js';

export async function authToken(req, res, next) {
  try {
    const provided = req.body?.token; 
    const staticToken = process.env.TOKEN;

    
    if (staticToken && provided === staticToken) {
      return next();
    }

    
    return res.status(401).json({
      error: {
        code: 401,
        message: 'Invalid or missing token',
      },
    });
  } catch (err) {
    console.error('auth error:', err);
    return res.status(500).json({
      error: {
        code: 500,
        message: 'Internal Server Error',
      },
    });
  }
}
