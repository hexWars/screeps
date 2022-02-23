const p_creep = require('prototype_creep')
const prototype = require("./prototype");

let role = {
	/**
	 * 从stoage转到控制器
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		var opts = {visualizePathStyle: {stroke: '#ffffff'}}
		if (creep.store[RESOURCE_ENERGY] == 0) {
			var target = Game.getObjectById(creep.memory.targetId)
			if (target) {
				if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, opts);
				}
			}
		} else {
			// if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
			// 	creep.moveTo(creep.room.controller, opts);
			// }
			if (creep.upgradeController(Game.rooms["E55N12"].controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.rooms["E55N12"].controller, opts);
			}
		}
	}
}

module.exports = role;
