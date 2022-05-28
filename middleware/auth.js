const jwt = require("jsonwebtoken");

function useAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Please provide valid credentials." });
  }

  jwt.verify(token, process.env.ACC_TOK_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid credentials." });
    }
    req.user = user;
    next();
  });
}

module.exports = useAuth;
