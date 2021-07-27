const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require("express");
const jobs = require('./jobs');
const cors = require('cors');
const {generateMap, createOrReturnUser} = require('./models/repository')
const {find, findOne, update} = require('./models/db')
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
const { ObjectID } = require("mongodb");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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

app.get("/userjobs", auth, (req,res) => {
  let jobove = jobs.getJobsForUser(cron.scheduledJobs,req.userId)
  if(jobove.length){
    const returnTimes = jobove.reduce((prev, curr) => {
      if(Array.isArray(prev))
      {
        return [...prev, {arrivalTime:curr.props.nextInvocation._date.c, heroId:curr.props.heroId}] 
      }
      else{
        return [{arrivalTime:curr.props.nextInvocation._date.c, heroId:curr.props.heroId}]
      }
    })

    if(Array.isArray(returnTimes)){
      return res.status(200).json(returnTimes)
    }
    return res.status(200).json([])
  }
  else{
    return res.status(200)
  }
})

app.get("/heromarch/:heroId", auth, async (req,res) => {
  let job
  try{
    const hero = await findOne('hero',{_id:ObjectID(req.params.heroId)})
    if(!hero){
      return res.status(400).json({message:"No such hero"})
    }
    if(req.userId !== hero.userId){
      return res.status(400).json({message:"Not enough privilige"});
    }
    job = jobs.getHeroMarch(cron.scheduledJobs,req.params.heroId)
    if(job){
      return res.status(200).json({timeOfArrival:job.props.nextInvocation._date.c});
    }
    else{
      return res.status(200).json({message:"Hero is not  marching yet"})
    }
  }
  catch(err){
    console.log(err)
    return res.status(400).json(err);
  }

})

app.post("/move",auth, async (req,res) => {
  /*
    0.Funkciq koqto vrushta pravilnoto vreme za razstoqnie kato tekst
    1.Да се отбележи че героят в момента пътува и да не се допуска да се движи пак ако пътува
    1.Iskame da proverim dali destinaciqta e zaeta ot armiq - Checked
    2.Ako e zaeta ot armiq pritejavana ot human player iskame da pratim  notifikaciq na napadnatiq
    3.Iskame da pusnem Cron Job koito da se izpylni sled koeto vryshta nqkakva funkciq koqto smqta razstoqniqta
    4.Sled zavarshvane na Cron Joba iskame da se izpylni ili Move Action ili Attack Action
  */
  let hero;
  try{
    hero = await findOne('hero',{_id:ObjectID(req.body.heroId)})
  }
  catch(err){
    return res.status(400).json(err);
  }
  if(!hero){
    return res.status(404).json({message:"No such hero"})
  }

  if(hero.marching){
    return res.status(200).json({message:"While the hero is marching you can't change his destination"})
  }

  const destinationX = req.body.x;
  const destinationY = req.body.y;
  let opposingHero;
  try{
    opposingHero =  await checkArmyAtDestination(destinationX,destinationY);
  }
  catch(err){
    return res.status(400);
  }
  if(opposingHero){
    if(opposingHero.userId === hero.userId){
      return res.status(200).json({message:"You can't go there. The spot is taken of another friendly hero."})
    }
    return res.status(200).json({message:"Opposing Army there can't move"})
  }
  else{
    const timeRequired = utility.getTimeFromDistanceAndSpeed(hero.x,hero.y,destinationX,destinationY,hero.speed);
    
    try{
      hero.marching = true;
      await update('hero',{_id:hero._id}, {marching:true})
    }
    catch(err){
      return res.status(400).json(err);
    }
    await jobs.runOnce(timeRequired,moveHero,[req.userId,req.body.heroId,destinationX,destinationY], {userId:req.userId,heroId:hero._id});
    return res.status(200).json({message:"Army is  on it's way"});
  }
})

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});