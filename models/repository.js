const {createRandomSquare}  =  require('./models')
const {insertMany, find, insertOne} = require('./db')

module.exports = {
    generateMap:async function(sizeX,sizeY){
        let xCounter = sizeX;
        let yCounter = sizeY;
        const mapTillNow = [];
        while(yCounter > 0){
            xCounter = sizeX;
            while(xCounter > 0){
                mapTillNow.push(createRandomSquare(xCounter,yCounter))
                //Push square to mongo
                xCounter--;
            }
            yCounter--;
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
                user = await insertOne('user',{'userId':userId})
                return user
            }
            catch(err){
                return err;
            }
        }
    }
}