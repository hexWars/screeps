let creep_base = require('creep_base')
var com_Harvester = {

	/**
	 * @param {Creep} creep
	 * @param {"房间名(自动扫描房间资源并产出)"} roomName
	 * 地点: 废墟,container,掉落,墓碑
	 * opts: 查看种类并收集
	 * @param {"房间名"} toRoomName
	 * 地点: 优先级:extension>tower>storage
	 * opts: 判断并存放
	 * {creep.memory.looking:采集标志}
	 */
	run: function (creep, roomName, toRoomName) {
		let sources
		if (creep.memory.looking) {// 采集 废墟,container,掉落,墓碑
			if (creep_base.creep_to_room(creep, roomName)) {// 到达roomName
				sources = creep.room.find(FIND_RUINS);// 废墟
				if (sources.length > 0) {
					// 挖废墟
					if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
						creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
					}
				} else {
					sources = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {// 找container
						filter: function (obj) {
							return obj.structureType == STRUCTURE_CONTAINER
						}
					});
					if (sources.length > 0) {
						// 挖container函数
						if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
							creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
						}
					} else {
						sources = creep.room.find(FIND_DROPPED_RESOURCES)
						if (sources.length > 0) {
							// 挖掉落的资源
							if(creep.pickup(target) == ERR_NOT_IN_RANGE) {
								creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
							}
						} else {
							sources = creep.room.find(FIND_TOMBSTONES)
							if (sources.length > 0) {
								// 挖墓碑
								if(creep.withdraw(sources[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
									creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
								}
							}
						}
					}
				}
			}
		} else {
			if (creep_base.creep_to_room(creep, toRoomName)) {
				// sources = creep.room.find(FIND_STRUCTURES);// extension
				const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
					filter: function (obj) {
						return obj.structureType == STRUCTURE_EXTENSION &&
							obj.store.getFreeCapacity() > 0
					}
				});// extension
				if (target) {
					// 放拓展资源
					if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					}
				} else {
					sources = creep.room.find(FIND_MY_STRUCTURES, {
						filter: function (obj) {
							return obj.structureType == STRUCTURE_TOWER;
						}
					})
					if (sources.length > 0) {
						// 放资源到塔
						if (creep.transfer(sources[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
							creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
						}
					} else {
						sources = creep.room.find(FIND_MY_STRUCTURES, {
							filter: function (obj) {
								return obj.structureType == STRUCTURE_STORAGE;
							}
						})
						if (sources.length > 0) {
							// 放到仓库
							if (creep.transfer(sources[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
								creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffffff'}});
							}
						}
					}
				}
			}
		}
	}
};

module.exports = com_Harvester;
