var harvester = {

	/** @param {Creep} creep *
	 * @param roomName 要去取资源的房间名
	 * @param toRoomName 搬运到指定的房间名
	 */
	run: function (creep, roomName, toRoomName) {
		if (creep.store.getFreeCapacity() > 0) {// 有空余容量
			if (creep.room == Game.rooms[roomName]) {// 现在就在房间里
				var sources = Game.rooms[roomName].find(FIND_SOURCES_ACTIVE);
				if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				const exitDir = creep.room.findExitTo(Game.rooms[roomName]);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit);
			}
		} else {// 返回房间
			var targets = Game.rooms[toRoomName].find(FIND_STRUCTURES, {
				filter: (structure) => {
					// 是母巢或者拓展或者塔
					return (structure.structureType == STRUCTURE_EXTENSION ||
							structure.structureType == STRUCTURE_SPAWN ||
							structure.structureType == STRUCTURE_TOWER) &&
						structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
				}
			});
			if (targets.length > 0) {
				if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				}
			} else {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				creep.say("无目标")
			}
		}
	}
};

module.exports = harvester;
