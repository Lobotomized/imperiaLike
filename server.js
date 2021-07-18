const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require('cors');
const jobs = require('./jobs');
const actions = require('./actions');
const cors = require('cors');
const {generateMap, createOrReturnUser} = require('./models/repository')
const {find} = require('./models/db')

const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders:['Content-Type', 'Authorization']

}
 


var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

jobs.runEvery('*/5 * * * * *', actions.movePlayer)

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());

app.use(express.static("static"));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));





const auth = (req,res,next) => {
  const sessionCookie = req.cookies.session || "";
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((response) => {
      req.userId = response.user_id;
      console.log(req.userId, '   tuka')

      next();
    })
    .catch((error) => {
      return res.status(401).json({error})
    });
  }


app.post("/test", function(req,res) {
  generateMap(10,10).then((resp) => {
    return res.status(200).json(resp)
  }).catch((err) => {
    return res.status(400).json(err);
  })
})

app.get("/map", function(req,res) {
  find('map',{}).then((resp) => {
    return res.status(200).json(resp)
  }).catch((err) => {
    return res.status(400).json(err);
  })
})
// app.get("/test", function(req,res){
//   db.imperiaLike.find((err,dbResponse) => {
//     return res.status(200).json(dbResponse)
//   });
// })

app.get("/cookietest", auth, function(req,res) {
  res.send({session:req.cookies.session, logged:'Super Logged'})
})

app.post("/amILogged", auth, function(req,res) {
  console.log(req.userId)
  createOrReturnUser(req.userId).then((resp) => {
    console.log(resp)
    return res.status(200).json({user4e:resp})
  })
  
})


app.post("/sessionLogin", async (req, res) => {
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
