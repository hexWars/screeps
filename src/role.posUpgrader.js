var upgrader = {

	/** @param {Creep} creep *
	 * @param roomName 要去取资源的房间名
	 * @param controller 返回控制器对象
	 */
	// upgrading标记是可否升级之意
	run: function (creep, roomName, controller) {
		if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.upgrading = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
			creep.memory.upgrading = true;
			creep.say('⚡ upgrade');
		}

		if (creep.memory.upgrading) {// 回controller
			if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
				creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		} else {// 去指定房间采能量
			if (creep.room == Game.rooms[roomName]) {//在同个房间
				let sources = Game.rooms[roomName].find(FIND_SOURCES_ACTIVE);
				if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {// 不是同个房间
				// creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				const exitDir = creep.room.findExitTo(roomName);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	}
};

module.exports = upgrader;
