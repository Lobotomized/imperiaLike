const cron = require('node-schedule');


module.exports = {

    //Needs to take time and action
    runOnce: function(time,action,args = [], props){
        const job = cron.scheduleJob(Date.now() + time, function(){
             action(...args);
             job.cancel();
          });
          props.nextInvocation =  job.nextInvocation();
          job.props = props;
          return job
    },
    runEvery: function(time,action, args = [], props){
          const job = cron.scheduleJob('*/'+ time +' * * * * *', function(){
            action(...args);
          });
          job.props = props;
          return job 
        },
    runAllGlobal: function(){
        
    },
    getJobsForUser:function(jobs, userId){
        let valueArr = Object.values(jobs);
        valueArr = valueArr.filter((val, ind) => {
            if(val && val.props){
                return val.props.userId === userId;
            }
        })
        return valueArr
    },
    getHeroMarch:function(jobs, heroId){
      const valueArr = Object.values(jobs);
      const march = valueArr.find((val, ind) => {
          if(val && val.props){
            console.log(val.props.heroId, heroId, val.props.heroId+"" == heroId+"")
              return val.props.heroId+"" === heroId+"";
          }
      })
      return march
  }
}