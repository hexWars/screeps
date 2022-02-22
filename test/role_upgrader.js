let role = {
	/**
	 * 从stoage转到控制器
	 * @param creep
	 */
	run: function (creep) {
		var opts = {visualizePathStyle: {stroke: '#ffffff'}}
		if (creep.store.getFreeCapacity() == 0) {
			if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(creep.room.controller, opts);
			}
		} else {
			var target = Game.getObjectById(creep.memory.targetId)
			if (target) {
				if(creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(target, opts);
				}
			}
		}

	}
}

module.exports = role;
