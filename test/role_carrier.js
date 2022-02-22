let repair = require('role_repairer')
let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		if (creep.store.getFreeCapacity() == 0) {//剩余容量
			if (!creep.fillSpawnEnergy()) {
				//todo 其他工作
				if (!creep.fillTower()) {
					repair.run(creep)
				}
			}
		} else {
			//todo 仅允许container, storage, link, 墓碑
			creep.withdrawStructure(Game.getObjectById(creep.memory.targetId))
		}
	}
}

module.exports = role;
