var roleupgraderout= {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
	    }
	    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
	        creep.memory.upgrading = true;
	    }
        if(creep.memory.upgrading&&creep.goToRoom(creep.memory.home)) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        else if(creep.goToRoom(creep.memory.home)) {
            var storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => {
                    return (structure.structureType == STRUCTURE_LINK || structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store[RESOURCE_ENERGY] > 0;
				}
			});
			if(storage){
				if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(storage);
				}
			}
			else{
				var sources = creep.room.find(FIND_SOURCES);
				if(creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[1]);
				}
			}
        }
     
	}
};

module.exports = roleupgraderout;