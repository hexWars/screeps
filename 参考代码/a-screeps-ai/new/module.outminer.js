var outresour={
    run:function(home,taroom){
        var creepname='reo'+taroom;
        if(!Memory.outresour){Memory.outresour = {}}
        if(!Game.creeps[creepname]&&(!Game.rooms[taroom]||!Memory.outresour[taroom]||(Game.rooms[taroom].controller&&Game.rooms[taroom].controller.reservation&&(Game.rooms[taroom].controller.reservation.ticksToEnd<3500||Game.rooms[taroom].controller.reservation.username!='liuzhihao')))){
            var spawn = getAvaliableSpawn(home)
            if(spawn){spawn.spawnCreep([MOVE,MOVE,CLAIM,CLAIM],creepname)}
        }
        if(Game.rooms[taroom]&&Game.time%5==0){
            var enermy=Game.rooms[taroom].find(FIND_HOSTILE_CREEPS,{filter:o=>(o.getActiveBodyparts(ATTACK)>0)})
            var enermy1=Game.rooms[taroom].find(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_INVADER_CORE)})  
            if(enermy1.length>0){
                var spawn = getAvaliableSpawn(home)
                if(spawn){spawn.spawnCreep([ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'G'+taroom,{memory: {role:'guarder',taroom:taroom}})}
            }
            if(enermy.length>0){
                var spawn = getAvaliableSpawn(home)
                if(spawn){spawn.spawnCreep([TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK],'G'+taroom,{memory: {role:'guarder',taroom:taroom}})}
            }
        }
        if(Game.creeps[creepname]){
            var creep=Game.creeps[creepname];
            if(creep.goToRoom(taroom)){
                if(!Memory.outresour[taroom]){
                    Memory.outresour[taroom] = {}
                    let sources = creep.room.find(FIND_SOURCES);
                    Memory.outresour[taroom].length=sources.length;
                    for(var i = 0;i<sources.length;i++){
                        if(!Memory.outresour[taroom][i]){Memory.outresour[taroom][i] = {}}
                        Memory.outresour[taroom][i].id = sources[i].id;
                    } 
                }
                if(creep.room.controller && creep.room.controller.reservation&&creep.room.controller.reservation.username!='liuzhihao') {
                    if(creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }else{
                    if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
        if(Memory.outresour[taroom]&&Game.time%5==0){
            let avaEnergy = Game.rooms[home].energyAvailable; 
            for(let i=0;i<Memory.outresour[taroom].length;i++){
                if(!_.some(Game.creeps, c => c.memory.role == 'outharvest' && c.memory.outsourceId == Memory.outresour[taroom][i].id)){
                    var bodyh = [];
                    for (let i = 0; i < 6; i++) {bodyh.push(WORK);}
                    autoSpawnCreep(Memory.outresour[taroom][i].id,'outharvest','ouh'+Memory.outresour[taroom][i].id,home,taroom,bodyh)
                }
                if(!_.some(Game.creeps, c => c.memory.role == 'outmove' && c.memory.outsourceId == Memory.outresour[taroom][i].id)){
                    var bodym = [];
                    if(Game.rooms[taroom]&&
                    (Game.rooms[taroom].find(FIND_CONSTRUCTION_SITES).length>0||
                    Game.rooms[taroom].find(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_ROAD&&o.hits / o.hitsMax <= 0.6)}).length>0))
                    {bodym.push(WORK);bodym.push(MOVE);bodym.push(WORK);avaEnergy=avaEnergy-250}
                    var numberOfParts = Math.floor(avaEnergy / 150);        
                    numberOfParts = Math.min(numberOfParts, 10);
                    numberOfParts = Math.max(6, numberOfParts)
                    for (let i = 0; i < numberOfParts; i++) {bodym.push(CARRY);bodym.push(MOVE);bodym.push(CARRY);}
                    autoSpawnCreep(Memory.outresour[taroom][i].id,'outmove','oum'+Memory.outresour[taroom][i].id,home,taroom,bodym)
                }
            }
        }    
        if(Memory.outresour[taroom]){
            for(let i=0;i<Memory.outresour[taroom].length;i++){
                var hcreep=Game.creeps['ouh'+Memory.outresour[taroom][i].id]
                var mcreep=Game.creeps['oum'+Memory.outresour[taroom][i].id]
                if(hcreep)outresour.harsour(hcreep)
                if(mcreep)outresour.movesour(mcreep)
            }
        }   
    }, 
    harsour:function(creep){
        var resourse=Game.getObjectById(creep.memory.outsourceId)
        if(!resourse)return;
        if(creep.pos.isNearTo(resourse))creep.memory.work=true
        if(creep.memory.work&&resourse.energy>0)creep.harvest(resourse);     
    },
    movesour:function(creep){
        var needmovecreep=Game.creeps['ouh'+creep.memory.outsourceId]
        if(!needmovecreep)return;
        if(needmovecreep&&!needmovecreep.memory.work&&creep.store.getUsedCapacity()==0){
            if(creep.pos.x==0||creep.pos.x==49||creep.pos.y==0||creep.pos.y==49){creep.pull(needmovecreep);needmovecreep.move(creep);creep.move(needmovecreep)}
            if(creep.goToRoom(needmovecreep.room.name)||needmovecreep.pos.x==0||needmovecreep.pos.x==49||needmovecreep.pos.y==0||needmovecreep.pos.y==49){
                if(!creep.pos.isNearTo(needmovecreep)&&creep.room.name==needmovecreep.room.name){
                    creep.moveTo(needmovecreep)
                }else{
                    creep.pull(needmovecreep)
                    needmovecreep.move(creep)
                    if(creep.goToRoom(creep.memory.taroom)){
                        var resourse=Game.getObjectById(creep.memory.outsourceId)
                        creep.moveTo(resourse)
                        if(creep.pos.isNearTo(resourse))creep.move(needmovecreep)
                    }
                }
            }
        }else{
            if(creep.store.getUsedCapacity()==0){
                if(creep.goToRoom(creep.memory.taroom)){
                    if(!creep.pos.isNearTo(needmovecreep)){creep.moveTo(needmovecreep)}
                    else{
                        var target=creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);
                        if(target[0])creep.pickup(target[0])
                    }
                }
            }else{
                if(creep.goToRoom(creep.memory.home)){
                    if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage);
                    }
                }
            }
        }
        if(creep.room.name==creep.memory.taroom&&creep.getActiveBodyparts(WORK)>0&&creep.store.getUsedCapacity()>0){
            var buildtarget=creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3);
            var rapirtarget=creep.pos.findInRange(FIND_STRUCTURES,3,{filter:o=>(o.structureType == STRUCTURE_ROAD&&o.hits / o.hitsMax <= 0.9)})  
            rapirtarget.sort((a,b) => a.hits - b.hits);
            if(buildtarget[0])creep.build(buildtarget[0])
            if(rapirtarget[0])creep.repair(rapirtarget[0])
        }
    }
}
module.exports = outresour;
function getAvaliableSpawn(room){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == room && spawn.spawning == null){
            return spawn
        }
    }
    return null; 
}
function autoSpawnCreep(id,role,creepName,roomName,taroom,body){
    var spawn = getAvaliableSpawn(roomName)
    if(spawn){
        spawn.spawnCreep(body,creepName,{memory: {home:roomName,taroom:taroom,role:role,outsourceId:id}})
    }
}
