const p_creep = require('prototype_creep')
const prototype = require("prototype");
let role = {
	/**
	 * targetId 攻击目标Id
	 * targetRoomName 目标所在房间名
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
			var target = Game.getObjectById(creep.memory.targetId)
			if (target) {
				if(creep.attack(target) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			creep.to_room(creep.memory.targetRoomName);
		}

	}
}

module.exports = role;
