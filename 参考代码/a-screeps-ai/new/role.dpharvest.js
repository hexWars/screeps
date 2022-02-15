var dpharvest={
    run:function(creep){
        if(!creep.memory.haring)creep.memory.haring=true
        if(!creep.memory.haring && creep.store.getUsedCapacity() == 0) {
            creep.memory.haring = true;
	    }
	    if(creep.memory.haring && creep.store.getFreeCapacity() == 0) {
	        creep.memory.haring = false;
	    }
        if(creep.ticksToLive<(creep.memory.tickToget+100)){creep.memory.haring = false;}
        if(creep.memory.haring){
            if(creep.goToRoom(creep.memory.taroom)){
                var deposits=Game.getObjectById(creep.memory.depositsID);
                if(creep.harvest(deposits) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(deposits,{ignoreCreeps:false});
                }
                if(!creep.memory.tickToget&&creep.pos.isNearTo(deposits)){creep.memory.tickToget=(1500-creep.ticksToLive);}
            }
        }else{
            if(creep.goToRoom(creep.memory.home)){
                var terminal=creep.room.terminal;
                if(creep.memory.boost==true){
                    creep.removemyboost();
                }else if(creep.store.getUsedCapacity()>0){
                    for(const resourceType in creep.store) {
                        if(creep.transfer(terminal, resourceType) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(terminal);
                        }
                    }
                }else{
                    const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES,{filter:{structureType:STRUCTURE_SPAWN}})
                    if(!creep.pos.isNearTo(spawn))creep.moveTo(spawn)
                    else spawn.recycleCreep(creep)
                }
            }
        }
    }
}
module.exports=dpharvest;