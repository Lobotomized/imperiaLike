const cron = require('node-schedule');


module.exports = {

    //Needs to take time and action
    runOnce: function(time,action,args = [], name){
        const job = cron.scheduleJob(name,time, function(){
             action(...args);
             job.cancel();
          });
    },
    runEvery: function(time,action, args = [], name){
          cron.scheduleJob(name,time, function(){
            action(...args);
          });    
        },
    runAllGlobal: function(){
        
    }
}