const prototype = require("./prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store[RESOURCE_ENERGY] == 0) {// self
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				var target = Game.getObjectById(creep.memory.selfId)
				if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}, reusePath: 30})
				}
			} else {
				creep.to_room(creep.memory.selfRoomName)
			}
		} else {// target
			if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
				var target = Game.getObjectById(creep.memory.targetId)
				if (creep.upgradeController(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} else {
				creep.to_room(creep.memory.targetRoomName)
			}
		}
	}
}

module.exports = role;
