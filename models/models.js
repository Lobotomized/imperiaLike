const squareTypes = [1,2,3,4,5]

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
        formation:formation,
        speed:speed,
    }
}

const createRandomHero = function(userId){

    /*
        Get Available X and Y
    */
    return createNewHero(1,1,userId,createDefaultFormation(),5)
}

const armyAvailableSquare = function(){

}


module.exports = {
    //Models
    createRandomSquare:createRandomSquare,
    createNewCastle:createNewCastle,
    createNewHero:createNewHero,
    createRandomHero:createRandomHero
}