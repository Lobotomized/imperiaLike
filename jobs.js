const cron = require('node-schedule');


module.exports = {

    //Needs to take time and action
    runOnce: function(time,action,args = []){
        const job = cron.scheduleJob(time, function(){
             action(...args);
             job.cancel();
          });
    },
    runEvery: function(time,action, args = []){
          cron.scheduleJob(time, function(){
            action(...args);
          });    
        },
    runAllGlobal: function(){
        
    }
}