var fix = {

	/** @param {Creep} creep *
	 */
	run: function (creep) {
		if (creep.store.getFreeCapacity() > 49) {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					// 母巢,拓展,塔,小容器,大容器
					return (
							structure.structureType === STRUCTURE_STORAGE
						) &&
						structure.store.getCapacity(RESOURCE_ENERGY) > 10000;
				}
			});
			if (targets.length > 0) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				creep.withdraw(targets[0], RESOURCE_ENERGY);
			} else {
				console.log(creep.name + "未发现资源")
			}
		} else {
			var targets = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					// 母巢,拓展,塔,小容器,大容器
					if (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) return false
					return structure.hits < structure.hitsMax / 2;
				}
			});
			if (targets.length > 0) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				creep.repair(targets[0]);
			} else {
				creep.moveTo(44, 47)
				// console.log("无目标")
			}
		}


	}
};

module.exports = fix;
