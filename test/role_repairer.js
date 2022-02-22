let role = {
	/**
	 * 血量小于 比例 的路进行修复
	 * @param creep
	 */
	run: function (creep) {
		var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => {
				// 母巢,拓展,塔,小容器,大容器
				return (structure.structureType === STRUCTURE_ROAD) &&
					structure.hits < structure.hitsMax / 2;
			}
		});
		if (target) {
			if (creep.repair(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}

	}
}

module.exports = role;
