const p_creep = require('prototype_creep')
const prototype = require("./prototype");

let role = {
	/**
	 * 从stoage转到控制器
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store[RESOURCE_ENERGY] == 0) {// 资源为0 self
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				var target = Game.getObjectById(creep.memory.selfId)
				if (target) {
					if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
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
