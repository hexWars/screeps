const creep_base = require('creep_base')
const prototype = require("prototype");

let role = {
	/**
	 * 建造者
	 * targetId是取出的建筑的id,必须默认从storage取出能量
	 * targetRoomName代表要修建的房间名
	 * @param creep
	 */
	// selfId, selfRoomName, targetId, targetRoomName
	run: function (creep) {
		prototype()
		if (creep.store[RESOURCE_ENERGY] == 0) {// self
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				var target = Game.getObjectById(creep.memory.selfId)
				if (target) {
					if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				}
			} else {
				creep.to_room(creep.memory.selfRoomName)
			}
		} else {// target
			if (creep.room == Game.rooms[creep.memory.targetRoomName]) {
				var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
				if (targets.length > 0) {
					if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
				}
			} else {
				creep.to_room(creep.memory.targetRoomName)
			}
		}
	}
}

module.exports = role;
