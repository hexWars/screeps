const p_creep = require('prototype_creep')
const prototype = require("./prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store.getFreeCapacity() == 0) {//剩余容量
			var targets = Game.spawns[creep.memory.spawnName].room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType === STRUCTURE_CONTAINER) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if (targets.length > 0) {
				if (creep.transfer(targets[targets.length-1], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[targets.length-1]);
				}
			} else {
				creep.say("无目标")
			}
		} else {
			var target = Game.getObjectById(creep.memory.targetId)
			console.log(creep.harvest(target))
			if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target)
			}
		}
	}
}

module.exports = role;
