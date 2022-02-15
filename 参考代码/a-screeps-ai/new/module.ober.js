var Ober = {
    run: function(roomName) {
        //obsource
        var room=Game.rooms[roomName]
        var observer =room.observer
        if(!Memory.waisour){Memory.waisour = {}}
        if(!Memory.waisour[roomName]){Memory.waisour[roomName] = {}}
        var number=Object.keys(Memory.waisour[roomName]).length
        if(Memory.waisour[roomName]){
            for(let i in Memory.waisour[roomName]){ 
                var obroom=Memory.waisour[roomName][i].roomName
                if(Game.time%(number)==i){observer.observeRoom(obroom);}
                var flag=Game.time%(number)-1
                if(flag<0)flag=number-1
                if(i!=flag)continue;
                
                var taroom=Memory.waisour[roomName][flag].roomName
                var deposits=Memory.waisour[roomName][flag].deposits
                var powerbank=Memory.waisour[roomName][flag].powerbank                                
                if(!deposits||!powerbank){                                       
                    if(Game.rooms[taroom]){
                        deposits=Game.rooms[taroom].find(FIND_DEPOSITS, {filter: s => s.lastCooldown <250})[0]; 
                        powerbank=Game.rooms[taroom].find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_POWER_BANK})[0];
                        deposits?(deposits=Memory.waisour[roomName][flag].deposits=deposits.id):(delete Memory.waisour[roomName][flag].deposits)
                        powerbank?(powerbank=Memory.waisour[roomName][flag].powerbank=powerbank.id):(delete Memory.waisour[roomName][flag].powerbank)
                    }
                }
                if(deposits){
                    //harvestsource
                    if(!_.some(Game.creeps, c => c.memory.role == 'dh' && c.memory.depositsID == deposits)){
                        let avaEnergy = Game.rooms[roomName].energyAvailable;
                        var numberOfParts = Math.floor(avaEnergy/ 700);
                        numberOfParts = Math.min(numberOfParts, 5);
                        var body = [];
                        for (let i = 0; i < numberOfParts*4; i++) {
                            body.push(WORK);
                            body.push(MOVE);
                        }
                        for (let i = 0; i < numberOfParts; i++) {
                            body.push(CARRY);
                            body.push(WORK);
                        }
                        var spawn = getAvaliableSpawn(roomName);
                        if(spawn){
                            spawn.spawnCreep(body,'h'+Game.time,{memory: {role:'dh',depositsID:deposits,taroom:taroom,home:roomName}});
                        }
                    }
                }
                if(powerbank&&0){
                    //harvestsource
                    if(!_.some(Game.creeps, c => c.memory.role == 'pt' && c.memory.powerbankID == powerbank)){
                        let avaEnergy = Game.rooms[roomName].energyAvailable;
                        var numberOfParts = Math.floor(avaEnergy/ 210);
                        numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
                        var body = [];
                        for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}
                        for (let i = 0; i < numberOfParts*2; i++) {body.push(ATTACK);}
                        var spawn = getAvaliableSpawn(roomName);
                        if(spawn&&numberOfParts>=4){
                            spawn.spawnCreep(body,'pt'+Game.time,{memory: {role:'pt',powerbankID:powerbank,taroom:taroom}});
                        }
                    }
                    var ptpower=_.filter(Game.creeps, c => c.memory.role == 'pt' && c.memory.powerbankID == powerbank)[0];
                    if(ptpower){
                        if(!_.some(Game.creeps, c => c.memory.role == 'hpt' && c.memory.healID == ptpower.id)){
                            let avaEnergy = Game.rooms[roomName].energyAvailable;
                            var numberOfParts = Math.floor(avaEnergy/ 550);
                            numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
                            var body = [];
                            for (let i = 0; i < numberOfParts; i++) {body.push(MOVE);}
                            for (let i = 0; i < numberOfParts*2; i++) {body.push(HEAL);}
                            var spawn = getAvaliableSpawn(roomName);
                            if(spawn&&numberOfParts>=4){
                                spawn.spawnCreep(body,'hpt'+Game.time,{memory: {role:'hpt',healID:ptpower.id,powerbankID:powerbank.id}});
                            }
                        }
                    }
                    if(powerbank.hits<80000){
                        var leng=Math.floor(powerbank.power / 1000)
                        if((_.filter(Game.creeps, c => c.memory.role == 'pm' && c.memory.powerbankID == powerbank).length<leng)){
                            var body = [];
                            for (let i = 0; i < 10; i++) {body.push(MOVE);}
                            for (let i = 0; i < 20; i++) {body.push(CARRY);}
                            var spawn = getAvaliableSpawn(roomName);
                            if(spawn){
                                spawn.spawnCreep(body,'pm'+Game.time,{memory: {role:'pm',powerbankID:powerbank,taroom:taroom,home:roomName}});
                            }
                        }
                    }
                }
            }
        }
    }
}
module.exports = Ober;
function getAvaliableSpawn(room){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == room && spawn.spawning == null){
            return spawn
        }
    }
    return null;
}