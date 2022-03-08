import {mount} from "../../mount";


export const harvester = function (creep) {
	mount()
	// let level = creep.room.controller.level
	if (creep.store.getFreeCapacity() > 0) {
		var sources = creep.room.find(FIND_SOURCES)
		if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
		}
		// if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
		// 	creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
		// }
	} else {
		var targets = creep.room.find(FIND_STRUCTURES, {
			filter: (structure) => {
				// 是母巢或者拓展或者塔
				return (structure.structureType == STRUCTURE_EXTENSION ||
						structure.structureType == STRUCTURE_SPAWN ||
						structure.structureType == STRUCTURE_TOWER) &&
					structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
			}
		});
		if (targets.length > 0) {
			if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}
	}

}
