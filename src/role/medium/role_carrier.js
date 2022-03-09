import {mount} from "../../mount";


export const role_carrier = function (creep) {
	mount()
	var s_storage = creep.room.storage;
	var s_terminal = creep.room.terminal;

	// for (const resourceType in target.store) {
	// 	if (creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
	// 		creep.moveTo(target)
	// 	}

	if (creep.store[RESOURCE_ENERGY] == 0) {//没有资源, self
		if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
			var obj = Game.getObjectById(creep.memory.selfId)
			if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
				creep.moveTo(obj, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10})
			}
		} else {
			creep.to_room(creep.memory.selfRoomName)
		}
	} else {// target
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			if (creep.fillSpawnEnergy()) {
				if (creep.fillTower()) {
					creep.fillStorage()
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName)
		}
	}
}
