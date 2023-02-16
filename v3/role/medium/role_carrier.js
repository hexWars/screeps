import {mount} from "../../mount";


export const role_carrier = function (creep) {
	mount()
	var s_storage = creep.room.storage;
	var s_terminal = creep.room.terminal;

	// for (const resourceType in target.store) {
	// 	if (creep.withdraw(target, resourceType) === ERR_NOT_IN_RANGE) {
	// 		creep.moveTo(target)
	// 	}

	try {
		if (creep.store.getUsedCapacity() == 0) {//没有资源, self
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				var obj = Game.getObjectById(creep.memory.selfId)
				if (obj.store[RESOURCE_ENERGY] == 0) {
					for (let sources in obj.store) {
						if (creep.withdraw(obj, sources) === ERR_NOT_IN_RANGE) {
							creep.moveTo(obj, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10})
						}
					}
				} else {
					if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(obj, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10})
					}
				}

			} else {
				creep.to_room(creep.memory.selfRoomName)
			}
		} else {// target
			if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
				if (creep.memory.targetId == "no") {
					if (creep.fillSpawnEnergy()) {
						if (creep.fillTower()) {
							creep.fillStorage()
						}
					}
				} else {
					let target = Game.getObjectById(creep.memory.targetId)
					for (let sources in creep.store) {
						if (creep.transfer(target, sources) === ERR_NOT_IN_RANGE) {
							creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 10});
						}
					}
				}
			} else {
				creep.to_room(creep.memory.targetRoomName)
			}
		}
	} catch (e) {
		console.log(creep.id + " 有错误")
	}


}
