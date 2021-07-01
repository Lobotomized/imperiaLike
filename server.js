const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require('cors');
const jobs = require('./jobs');
const actions = require('./actions');
const mongojs = require('mongojs')
const db = mongojs("mongodb+srv://Lobotomy:Micasmu4ka@cluster0.tippd.mongodb.net/imperiaLike?retryWrites=true&w=majority", ['imperiaLike'])

db.imperiaLike.find((err,res) => {
})



var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

jobs.runEvery('*/5 * * * * *', actions.movePlayer)

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.engine("html", require("ejs").renderFile);
app.use(express.static("static"));

app.use(bodyParser.json());
app.use(cookieParser());


const auth = (req,res,next) => {
  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((response) => {
      req.userId = response.user_id;
      next();
    })
    .catch((error) => {
      return res.redirect("/login");
    });
  }

app.get("/login", function (req, res) {
  res.render("login.html");
});

app.post("/test", function(req,res) {
  db.imperiaLike.insertOne({test:'blabla'}, function(err, dbResponse){
    return res.status(200).json(dbResponse);
  })
})
app.get("/test", function(req,res){
  db.imperiaLike.find((err,dbResponse) => {
    return res.status(200).json(dbResponse)
  });

})

app.get("/signup", function (req, res) {
  res.render("signup.html");
});

app.get("/profile", auth, function (req, res) {
  const sessionCookie = req.cookies.session || "";
  res.render("profile.html");
});

app.get("/", function (req, res) {
  res.render("index.html");
});

app.post("/amILogged", auth, function(req,res) {
  res.status(200).json({logged:"SUper Logged"})
})

app.post("/sessionLogin", (req, res) => {
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
      },
      (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
