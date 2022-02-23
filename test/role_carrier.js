let repair = require('role_repairer')
let prototype = require('prototype')
let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()
		if (creep.store[RESOURCE_ENERGY] == 0) {//没有资源, self
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				var obj = Game.getObjectById(creep.memory.selfId)
				if (creep.withdraw(obj, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					creep.moveTo(obj)
				}
			} else {
				creep.to_room(creep.memory.selfRoomName)
			}
		} else {// target
			if (creep.room == Game.rooms[creep.memory.selfRoomName]) {
				if (creep.fillSpawnEnergy()) {
					if (creep.fillTower()) {
						creep.fillStorage()
					}
				}
			} else {
				creep.to_room(creep.memory.targetRoomName)
			}
		}
	}
}

module.exports = role;
