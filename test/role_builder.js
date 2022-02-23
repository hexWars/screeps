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
		if (creep.store[RESOURCE_ENERGY] == 0) {
			var target = Game.getObjectById(creep.memory.targetId)
			if (target) {
				if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			}
		} else {
			if (creep_base.creep_to_room(creep, "E55N12")) {
				var targets = Game.rooms["E55N12"].find(FIND_CONSTRUCTION_SITES);
				if (targets.length > 0) {
					if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
						creep.moveTo(targets[0]);
					}
					return true
				}
				return false
			}
		}


	}
}

module.exports = role;
