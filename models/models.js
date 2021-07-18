const squareTypes = ['ice','pasture','rock','water','swamp']

const createRandomSquare = function(x,y){
    const type = squareTypes[Math.floor(Math.random()*squareTypes.length)];
    return {
        dbType:'square',
        x:x,
        y:y,
        type:type
    }
}

const createNewCastle = function(x , y , userId, unconquerable){
    return {
        x:x,
        y:y,
        owner:userId,
        unconquerable:unconquerable,
        buildings:{
            goldMine:0,
            trainingGrounds:0,
            Hospice:0,
            Tavern:0,
            HeroShrine:0,
        },
        heroes:[/* Hero Ids */]
    }
}



const createDefaultSoldier = function(){
    return {
        name: 'me',
        attack:[5,5,5,5,5,5],
        defense:[0,0,0,0,0,0],
        hp:10,
        maxHp:10
    }
}

const createDefaultFormation = function(){
    return {
        frontLane:[createDefaultSoldier()],
        backLane:[createDefaultSoldier()]
    }
}

const createNewHero = function(x,y,userId,formation, speed){
    return {
        x:x,
        y:y,
        userId:userId,
        formation:createDefaultFormation(),
        speed:speed,
    }
}

/*
    We need a utility method that gets tile, hero and castle for particular square

    We need a method that checks for available x/y for particular castle

    We need a method that when creates a new User it also creates a default hero for him with a default army at an available x/y

    We need a move method for heroes

    We need a method that when creates a  new User it also creates a default castle for him  at an  available x/y

*/


module.exports = {
    //Models
    createRandomSquare:createRandomSquare,
    createNewCastle:createNewCastle,
    createNewHero:createNewHero
}