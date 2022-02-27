let prototype = require('prototype')
let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		var s_storage = creep.room.storage;
		var s_terminal = creep.room.terminal;
		if (false) {
			if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
				if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
					if (creep.transfer(s_terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(s_terminal, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				} else {
					creep.to_room(creep.memory.targetRoomName)
				}
			} else {// self
				if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
					if (creep.withdraw(s_storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(s_storage, {visualizePathStyle: {stroke: '#ffffff'}})
					}
				} else {
					creep.to_room(creep.memory.selfRoomName)
				}
			}
		} else {
			if (creep.store[RESOURCE_ENERGY] == 0) {//没有资源, self
				if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
					var obj = Game.getObjectById(creep.memory.selfId)
					if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(obj)
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
	}
}

module.exports = role;
