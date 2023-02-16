import {mount} from "../../mount";


export const builder = function (creep) {
	mount()
	// if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
	// 	creep.memory.building = false;
	// 	creep.say('🔄 harvest');
	// }
	// if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	// 	creep.memory.building = true;
	// 	creep.say('🚧 build');
	// }
	//
	// if (creep.memory.building) {
	// 	var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
	// 	if (targets.length) {
	// 		if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
	// 			creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
	// 		}
	// 	} else {
	// 		var targets = creep.room.find(FIND_MY_STRUCTURES, {
	// 			filter: function (obj) {
	// 				return obj.structureType != STRUCTURE_WALL && obj.structureType != STRUCTURE_RAMPART && obj.hits < obj.hitsMax
	// 			}
	// 		})
	// 		if (targets.length) {
	// 			if (creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
	// 				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
	// 			}
	// 		}
	// 	}
	// } else {
	// 	// var sources = creep.room.find(FIND_SOURCES);
	// 	var sources = creep.room.sources()
	// 	if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
	// 		creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
	// 	}
	// }

	if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
		creep.memory.upgrading = false;
		creep.say('🔄 harvest');
	}
	if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
		creep.memory.upgrading = true;
		creep.say('⚡ upgrade');
	}

	if (creep.memory.upgrading) {
		if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
		}
	} else {
		// var sources = creep.room.find(FIND_SOURCES);
		var sources = creep.room.sources()
		if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
			creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
		}
	}

}
