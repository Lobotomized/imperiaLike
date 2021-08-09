module.exports =  {
    rollArray: function(arr){
        return arr[Math.floor(Math.random() * arr.length)]; 
    },
    shuffleArray: (array) => {
        var currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      },
      pickWhoToAttack: function(board,attacker) {
        const lane = attacker.lane;
        const attackerTeam = attacker.team;
        const attackedTeam = attackerTeam === 'defenders' ? 'attackers' : 'defenders'
        const attackedActiveLane = board[attackedTeam].lane1.length ? 'lane1' : 'lane2'
    
        /*
            Find targets depending on attackType
    
        */
         if(lane === 'lane1' || (lane === 'lane2' && board[attackerTeam].lane1.length === 0) || attacker.attackType === 'archer'){
            //If you are first lane attack
            let rotations = attacker.position;
            while(rotations >= 0){
                if(board[attackedTeam][attackedActiveLane][rotations]){     
                    return board[attackedTeam][attackedActiveLane][rotations]
                }
                rotations--;
            }
         }
      },
      attack: function(attacker,defender) {
        const atc = this.rollArray(attacker.attack);
        const def = this.rollArray(defender.defense);
        const newBoard = JSON.parse(JSON.stringify(board4e));
        if(newBoard[attacker.team][attacker.lane][attacker.position]){
            newBoard[attacker.team][attacker.lane][attacker.position].attacker = true;
            if(newBoard[defender.team][defender.lane][defender.position]){
                newBoard[defender.team][defender.lane][defender.position].defender = true;
                newBoard[defender.team][defender.lane][defender.position].def = def;
            }
            newBoard[attacker.team][attacker.lane][attacker.position].atc = atc;
            if(atc > def){
                defender.hp -= (atc - def)
            }
        }
    
        // console.log(newBoard[attacker.team][attacker.lane][attacker.position].attacker)
        return {atc:atc, def:def, attacker:attacker.position, defender:defender.position, board:JSON.parse(JSON.stringify(newBoard))}
      },
    checkWin: function(board)  {
        if(!board.defenders.lane1.length && !board.defenders.lane2.length){
            board.winner = 'Attackers'
            return 'Attackers'
        }
        else if(!board.attackers.lane1.length && !board.attackers.lane2.length){
            board.winner = "Defenders";
            return 'Defenders'
        }
        return null
    },
    removeDeathCreatures: function(board) {
        board.defenders.lane1 = board.defenders.lane1.filter((creature) => {
            return creature.hp > 0;
        })
        board.defenders.lane2 = board.defenders.lane2.filter((creature) => {
            return creature.hp > 0;
        })
        board.attackers.lane1 = board.attackers.lane1.filter((creature) => {
            return creature.hp > 0;
        })
        board.attackers.lane2 = board.attackers.lane2.filter((creature) => {
            return creature.hp > 0;
        })
    },
    general:function(board) {
        const returnedObj = {
            board: JSON.parse(JSON.stringify(board)),
            history:[], 
            winner:null
        }
    
        /*
            Find who should be the attacker //We have some version
        */
    
        let collectionArr = [ ...board.defenders.lane1, ...board.defenders.lane2, 
            ...board.attackers.lane1, ...board.attackers.lane2];
        collectionArr = this.shuffleArray(collectionArr);
         while(!returnedObj.winner){
            collectionArr.forEach((member) => {
                /*
                    Find who should he attack //We have some version
                */
                const target = this.pickWhoToAttack(board,member)
                //        Roll for attacker and Defender We have basic version
                if(target != undefined){
                    returnedObj.history.push(this.attack(member,target))
                }
                this.removeDeathCreatures(board);
                //Check if you win
        
                const winRes = this.checkWin(board);
                if(winRes){
                 returnedObj.winner = winRes;
                }
            })
         }
        return returnedObj;
    }
}