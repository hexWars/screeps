var roleRepaier ={
    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.repairing = false;
	    }
	    if(!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
	        creep.memory.repairing = true;
	    }
        if(creep.store[RESOURCE_ENERGY] == 0||!creep.memory.mytarget){
            var mytarget= creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_WALL)
                    && structure.hits / structure.hitsMax <= 0.9;
                }
            });
            mytarget.sort((a,b) => a.hits - b.hits);
            if(mytarget.length)creep.memory.mytarget=mytarget[0].id
        }
        if(creep.memory.repairing){	
            if(creep.memory.mytarget) {
                if(!creep.pos.isNearTo(Game.getObjectById(creep.memory.mytarget))){creep.moveTo(Game.getObjectById(creep.memory.mytarget));}
                const targets1 = creep.pos.findInRange(FIND_STRUCTURES,3, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_WALL)
                        && structure.hits / structure.hitsMax <= 0.9;
                    }
                });
                targets1.sort((a,b) => a.hits - b.hits);
                if(targets1[0]){creep.repair(targets1[0])}
            }
            else{
                const targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_RAMPART )
                        && structure.hits / structure.hitsMax <= 0.8;
                    }
                });
                if(targets.length > 0) {
                    if(creep.repair(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }  
            }
        }
        else{
            var storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE || structure.structureType == STRUCTURE_TERMINAL) &&
                        structure.store[RESOURCE_ENERGY] > 0;
				}
			});
            if(storage){
				if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(storage);
				}
			}
        }
    }    
}
module.exports = roleRepaier;
