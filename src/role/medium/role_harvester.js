import {mount} from "../../mount";


export const role_harvester = function (creep) {
	mount()
	if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId)
			for (let sources in creep.store) {
				if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
				}
			}

			if (target.structureType === STRUCTURE_LINK && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
				target.work()
			}
		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	} else {// self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var target = Game.getObjectById(creep.memory.selfId)
			if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	}
}

