import {mount} from "../../mount";

export const role_repairer = function (creep) {
	mount()
	if (creep.store[RESOURCE_ENERGY] == 0) {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			let obj = Game.getObjectById(creep.memory.selfId)
			if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj)
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART) &&
						structure.hits < (structure.hitsMax * 4 / 5);
				}
			});
			if (target) {
				if (creep.repair(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
				}
			} else {
				target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_WALL) &&
							structure.hits < 1000;
					}
				});
				if (target) {
					if (creep.repair(target) === ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				} else {
					let x = Math.ceil(Math.random() * 40)
					let y = Math.ceil(Math.random() * 40)
					creep.moveTo(x, y, {visualizePathStyle: {stroke: '#ffaa00'}});
				}

			}
		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	}
}


