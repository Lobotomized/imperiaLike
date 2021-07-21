const {update, find} = require('./models/db')
ObjectID = require('mongodb').ObjectID

const getDistance = function(startingX,startingY,endPointX,endPointY){
    const yDist = Math.Abs(y2 - y1);
    const xDist = Math.Abs(x2 - x1);
    const diagShortcut = Math.Min(yDist, xDist);
    return yDist + xDist - diagShortcut;
}

module.exports = {
    utility:{
        getTimeFromDistanceAndSpeed:function(startingX,startingY, endPointX, endPointY,speed){
            const distance = getDistance(startingX, startingY, endPointX, endPointY);
            return Math.floor((distance*50)/speed);
        },
        getDistance: getDistance
    },
    checkArmyAtDestination: async function(destinationX,destinationY){
        const heroArr = await find('hero',{x:destinationX, y:destinationY})
        let hero;
        if(heroArr.length){
            hero = heroArr[0];
            return hero;
        }
    },
    moveHero: async function(userId, heroId, destinationX,destinationY){
        const heroArr = await find('hero',{_id:ObjectID(heroId)})
        const hero = heroArr[0];
        if(userId === hero.userId){
            let res;
            try{
                res = await update('hero',{_id:ObjectID(heroId)},{x:destinationX,y:destinationY})
            }
            catch(err){
                throw err;
            }
            return res;
        }
        else{
            throw {message:'You have no access', name:"Wrong User Exception"}
        }
    }
}