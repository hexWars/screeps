var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function(creep) {
		var container,linker,containercreep,workpart
		if(Memory.linker[creep.room.name]&&Memory.linker[creep.room.name].linkTo1){
			linker=Game.getObjectById(Memory.linker[creep.room.name].linkTo1)
		}
		if(Memory.mover[creep.room.name]&&Memory.mover[creep.room.name].container){
			container=Game.getObjectById(Memory.mover[creep.room.name].container) 
			if(container)containercreep=_.filter(Game.creeps, (creep)=> creep.pos.x==container.pos.x&&creep.pos.y==container.pos.y);
		}
		workpart=creep.getActiveBodyparts(WORK)
		//工作
		if(creep.store[RESOURCE_ENERGY]>0&&creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){creep.moveTo(creep.room.controller);}
		//移动
		if(containercreep&&containercreep.length==0){
			if(!creep.pos.isEqualTo(container))creep.moveTo(container)
		}else if(container&&!creep.pos.isNearTo(container)){creep.moveTo(container)}
		else if(linker&&!creep.pos.isNearTo(linker))creep.move(creep.pos.getDirectionTo(linker))
	    //取能 
		if(creep.store[RESOURCE_ENERGY]<=workpart){
			if(linker&&linker.store[RESOURCE_ENERGY]>0){creep.withdraw(linker, RESOURCE_ENERGY) }
			else if(container&&container.store[RESOURCE_ENERGY]>0){creep.withdraw(container, RESOURCE_ENERGY)}
			else{
				var storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
							structure.store[RESOURCE_ENERGY] > 0;
					} 
				});
				if(storage&&storage.store[RESOURCE_ENERGY]>=50){
					if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(storage);
					}
				}
				else{
                    var sources = creep.room.find(FIND_SOURCES);
				    if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					    creep.moveTo(sources[0],{ignoreCreeps:false});
				    }
				}
			}
		}
	}
};

module.exports = roleUpgrader;

