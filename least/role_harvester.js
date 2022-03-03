const prototype = require("./prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store.getFreeCapacity() == 0) {//可用容量没了 target
			if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
				var target = Game.getObjectById(creep.memory.targetId)
				if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
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
}

module.exports = role;
