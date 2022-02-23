let repair = require('role_repairer')
let prototype = require('prototype')
let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store.getFreeCapacity() == 0) {//剩余容量
			if (!creep.fillSpawnEnergy()) {
			// 	todo 其他工作
				creep.fillStorage()
				creep.fillTower()
			}
		} else {
			let obj = Game.getObjectById(creep.memory.targetId)
			if (creep.withdraw(obj, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
				creep.moveTo(obj)
			}
		}
	}
}

module.exports = role;
