const {createRandomSquare, createRandomHero}  =  require('./models')
const {insertMany, find, insertOne, dropCollection} = require('./db')

module.exports = {
    generateMap:async function(sizeX,sizeY){
        try{
            await dropCollection('map')
        }
        catch(err){

        }
        let xCounter = 0;
        let yCounter = 0;
        const mapTillNow = [];
        while(yCounter < sizeY){
            xCounter = 0;
            while(xCounter < sizeX){
                mapTillNow.push(createRandomSquare(xCounter,yCounter))
                //Push square to mongo
                xCounter++
            }
            yCounter++;
        }
        try{
            return await insertMany('map',mapTillNow)
        }
        catch(err){
            return err;
        }
    },
    
    createOrReturnUser: async function(userId){
        let user;
        try{
            const userArr = await find('user',{'userId':userId})
            user = userArr[0];
        }
        catch(err){
        }

        if(!user){
            try{
                const firstHero = await insertOne('hero',createRandomHero(userId))
                user = await insertOne('user',{'userId':userId, 'heroes':[firstHero._id]})
                return user
            }
            catch(err){
                return err;
            }
        }
    }
}