const mongojs = require('mongojs')
const db = mongojs("mongodb+srv://Lobotomy:Micasmu4ka@cluster0.tippd.mongodb.net/imperiaLike?retryWrites=true&w=majority", ['imperiaLike'])

module.exports = {
    find:function(collection, match){
        return new Promise((resolve,reject) => {
            db[collection].find(match, function(err, dbResponse){
              if(err){
                  reject(err)
              }
              else{
                  resolve(dbResponse)
              }
            })
      })
    },
    insertOne:function(collection,obj){
        return new Promise((resolve,reject) => {
              db[collection].insertOne(obj, function(err, dbResponse){
                if(err){
                    reject(err)
                }
                else{
                    resolve(dbResponse)
                }
              })
        })
    },
    insertMany:function(collection,arr){
        return new Promise((resolve,reject) => {
              db[collection].insertMany(arr, function(err, dbResponse){
                if(err){
                    reject(err)
                }
                else{
                    resolve(dbResponse)
                }
              })
        })
    },
    dropCollection:function(collection){
        return new Promise((resolve,reject) => {
            db[collection].drop((err,dropOk) => {
                if(err){
                    reject(err)
                }
                else{
                    resolve(dropOk)
                }
            })
      })    
    },
    delete:function(collection, match){
        return new Promise((resolve,reject) => {
            db[collection].deleteMany(match, function(err, dbResponse){
              if(err){
                  reject(err)
              }
              else{
                  resolve(dbResponse)
              }
            })
      })
    },
    update:function(collection,match,update){
        return new Promise((resolve,reject) => {
            db[collection].updateOne(match, {$set:update}, function(err, dbResponse){
              if(err){
                  reject(err)
              }
              else{
                  resolve(dbResponse)
              }
            })
      })
    }
}