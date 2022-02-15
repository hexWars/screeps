var roleButtomUpgrader = {

	/** @param {Creep} creep **/
	// upgrading标记是可否升级之意
	run: function (creep) {
		// 如果该creep资源为0且upgrading为true
		if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.upgrading = false;
			creep.say('🔄 harvest');
		}
		// 如果容量为0(装满)且不在运行
		if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
			creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
		}

		if (creep.memory.upgrading) {
			// Spawn1母巢所在房间的控制器
			if (creep.upgradeController(Game.spawns['Spawn1'].room.controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(Game.spawns['Spawn1'].room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		} else {
			var sources = creep.room.find(FIND_SOURCES_ACTIVE);
			if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(sources[1], {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
};

module.exports = roleButtomUpgrader;
