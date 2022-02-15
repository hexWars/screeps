var roleRepaier = require('role.repaier');
var roleUpgrader = require('role.upgrader');
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
		if(!creep.memory.building&&creep.store.getFreeCapacity()==0) {
	        creep.memory.building = true;
	    }
		if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
	    }
		if(!creep.memory.home){creep.memory.home=creep.room.name}
		var sources1 = creep.pos.findInRange(FIND_DROPPED_RESOURCES,1);
        if(sources1.length) {creep.pickup(sources1[0]);creep.moveTo(sources1[0])}
		if(creep.goToRoom(creep.memory.home)){
			if(creep.memory.building) {
				const fixTarget = creep.pos.findInRange(FIND_STRUCTURES, 1, {
					filter: (structure) => structure.hits / structure.hitsMax <= 0.6 && (structure.structureType === STRUCTURE_ROAD||structure.structureType === STRUCTURE_CONTAINER)
				});			
				if (fixTarget.length&&0) {				
					creep.repair(fixTarget[0]);
				}else { 
					var targetsde = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);											
					if(targetsde) {
						if (creep.build(targetsde) == ERR_NOT_IN_RANGE) {
							creep.moveTo(targetsde,{ignoreCreeps:false});
						}
					}
					else{
						if(creep.room.controller.level>=4)roleRepaier.run(creep);
						else roleUpgrader.run(creep);
					}
					
				}
			}
			else{
				if(creep.memory.mytarget)delete creep.memory.mytarget;
				var storage = creep.room.storage;
				if((storage&&storage.store[RESOURCE_ENERGY]==0)||!storage){storage=creep.room.terminal;}
				var ruin = creep.room.find(FIND_RUINS,{filter:o=>(o.store[RESOURCE_ENERGY]>0)})
				if(ruin.length){
					if(creep.withdraw(ruin[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(ruin[0]);
					}
				}else{
					if(storage&&storage.store[RESOURCE_ENERGY]>0){
						if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(storage);
						}
					}
					else{
						let container = creep.pos.findInRange(FIND_STRUCTURES,3,{
							filter: s => s.structureType == STRUCTURE_CONTAINER&&s.store[RESOURCE_ENERGY]>0
						});
						if(container.length>0&&container[0].store[RESOURCE_ENERGY]>400){
							if(creep.withdraw(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
								creep.moveTo(container[0]);
							}
						}else{
							var sources = creep.pos.findClosestByPath(FIND_SOURCES,{filter:o=>(o.energy>0)});
							if(sources){
								if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
									creep.moveTo(sources,{ignoreCreeps:false});
								}
							}
						}
						
					}
				}
						
			}
		}

	}
};
module.exports = roleBuilder;