var roleHarvester = {

	/** @param {Creep} creep **/
	run: function (creep) {
		if (creep.store.getFreeCapacity() > 0) {
			var sources = creep.room.find(FIND_SOURCES);
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			// 传能量到拓展
			// structure 包括拓展
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					// STRUCTURE_EXTENSION 就是过滤找到拓展
					// STRUCTURE_SPAWN 是母巢结构
					return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if (targets.length > 0) {
				// 可以加个排序,去距离最近的
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			}
		}
	}
};

module.exports = roleHarvester;
