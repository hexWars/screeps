let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		var opts = {visualizePathStyle: {stroke: '#ffaa00'}}
		if (creep.store.getFreeCapacity() == 0) {//剩余容量
			var target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: (structure) => {
					// 母巢,拓展,塔,小容器,大容器
					return (structure.structureType === STRUCTURE_CONTAINER) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if (target) {
				if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} else {
				target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						// 母巢,拓展,塔,小容器,大容器
						return (structure.structureType === STRUCTURE_STORAGE) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				if (target) {
					if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target);
					}
				} else {
					creep.say("无目标")
				}
			}
		} else {
			var target = Game.getObjectById(creep.memory.targetId)
			if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, opts)
			}
		}
	}
}

module.exports = role;
