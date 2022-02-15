var power={
    atrun:function(creep){
        var powerbank=Game.getObjectById(creep.memory.powerbankID);
        if(creep.goToRoom(creep.memory.taroom)){
            if(powerbank&&creep.hits>300&&creep.attack(powerbank) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerbank);
            }
            if(!powerbank){creep.moveTo(25,25);}
        }
    },
    ahrun:function(creep){
        var healcreep=Game.getObjectById(creep.memory.healID)
        if(healcreep){
            if(creep.goToRoom(healcreep.room.name)){
                if(creep.heal(healcreep) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(healcreep);
                }
            }
        }else{
            var ptpower=_.filter(Game.creeps, c => c.memory.role == 'pt' && c.memory.powerbankID == powerbank.id)[0];
            if(ptpower){creep.memory.healID=ptpower.id}
        }
    },
    powerm:function(creep){
        var powerbank=Game.getObjectById(creep.memory.powerbankID);
        if(powerbank){creep.memory.pos=powerbank.pos;}
        if(creep.store.getUsedCapacity==0){
            if(creep.goToRoom(creep.memory.taroom)){
                if(powerbank&&!creep.pos.inRangeTo(powerbank, 3)){
                    creep.moveTo(powerbank);
                }
                if(!powerbank){
                    let power = creep.room.find(FIND_DROPPED_RESOURCES, {filter: (r) => r.resourceType === RESOURCE_POWER})[0];
                    if(creep.pickup(power) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(power);
                    }
                }
            }
        }else{
            if(creep.goToRoom(creep.memory.home)){
                var terminal=creep.room.terminal;
                for(const resourceType in creep.store) {
                    if(creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(terminal);
                    }
                }
            }
        }
    }
}
module.exports=power;