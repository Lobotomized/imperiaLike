const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const jobs = require('./jobs');
const cors = require('cors');
const {generateMap, createOrReturnUser} = require('./models/repository')
const {find, findOne} = require('./models/db')
const {moveHero, checkArmyAtDestination, utility} = require('./actions')
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  allowedHeaders:['Content-Type', 'Authorization']

}
const cron = require('node-schedule');


const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//  jobs.runEvery('*/1 * * * * *', function(){
//    console.log('vliza')
//  })

const PORT = process.env.PORT || 3000;
const app = express();


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
  createOrReturnUser(req.userId).then((resp) => {
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

app.post("/move",auth, async (req,res) => {
  /*
    0.Funkciq koqto vrushta pravilnoto vreme za razstoqnie
    1.Iskame da proverim dali destinaciqta e zaeta ot armiq - Checked
    2.Ako e zaeta ot armiq pritejavana ot human player iskame da pratim  notifikaciq na napadnatiq
    3.Iskame da pusnem Cron Job koito da se izpylni sled koeto vryshta nqkakva funkciq koqto smqta razstoqniqta
    4.Sled zavarshvane na Cron Joba iskame da se izpylni ili Move Action ili Attack Action
  */
 console.log(cron.scheduledJobs)
 let hero;

  try{
    hero = await findOne('hero',{_id:ObjectID(req.body.heroId)})
  }
  catch(err){
    return res.status(400).json(err);
  }

  const destinationX = req.body.x;
  const destinationY = req.body.y;
  let opposingArmy;
  try{
    opposingArmy =  await checkArmyAtDestination(destinationX,destinationY);
  }
  catch(err){
    return res.status(400);
  }
  if(opposingArmy){
    return res.status(200).json({message:"Opposing Army there can't move"})
  }
  else{
    // const timeRequired = utility.getTimeFromDistanceAndSpeed(starting)
    jobs.runOnce('*/60 * * * * *',moveHero,[req.userId,req.body.heroId,destinationX,destinationY], 'moving')
    return res.status(200).json({message:"Army is  on it's way"})
  }
})

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
