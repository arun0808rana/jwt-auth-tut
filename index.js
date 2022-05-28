

// https://www.youtube.com/watch?v=mbsmsi7l3r4&t=1359s
// generate access token key and refresh token keys in
// .env file using require('crypto').randomBytes(64).toString('hex')
// in node repl

require("dotenv").config();

const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const useAuth = require("./middleware/auth");

// dummy db data
const posts = [
  {
    username: "jason",
    designation: "doctor",
  },
  {
    username: "rocket",
    designation: "salesman",
  },
];

// dummy db refresh token array, usually stored in db
const refreshTokens = [];

app.use(express.json());

// helper fn
const generateAccessToken = (user) => {
  const token = jwt.sign(user, process.env.ACC_TOK_KEY, { expiresIn: "30s" });
  return token;
};

app.post("/login", (req, res) => {
  const user = { name: req.body.username };
  console.log(user,'logging...')
  const token = generateAccessToken(user);
  const refreshToken = jwt.sign(user, process.env.REF_TOK_KEY);
  refreshTokens.push(refreshToken);
  res.json({
    token,
    refreshToken,
  });
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({
      message: "Please send a refresh token.",
    });
  }

  const isRefreshTokenValid = refreshTokens.includes(refreshToken);
  if (!isRefreshTokenValid) {
    return res.status(403).json({
      message: "Invalid refresh token.",
    });
  }

  jwt.verify(refreshToken, process.env.REF_TOK_KEY, (err, user) => {
    console.log(user,'refreshing...')
    if (err) {
      return res.status(403).json({
        message: "Invalid refresh token.",
      });
    }
    const token = generateAccessToken({name:user.name});
    res.status(200).json({
      token,
    });
  });
});

app.get("/posts", useAuth, (req, res) => {
  const filteredPosts = posts.filter((post) => post.username === req.user.name);
  return res.json({ posts: filteredPosts });
});


app.delete('/logout', (req, res)=>{
  refreshTokens = refreshTokens.filter(token=>token !== req.body.token);
  res.status(204).json({
    message:'refresh token for this user deleted'
  })
})

app.listen(5000, () => console.log("listening"));
