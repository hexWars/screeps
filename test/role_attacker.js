let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		var target = Game.getObjectById(creep.memory.targetId)
		if (target) {
			if(creep.attack(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
}

module.exports = role;
