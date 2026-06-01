const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(403).json({
        success: false,
        error: "Forbidden - Invalid token",
      });
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Forbidden - Invalid or expired token",
    });
  }
}

module.exports = requireAdmin;
