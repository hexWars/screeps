var com_comprehensive = {

	/** @param {Creep} creep 单纯采集资源的creep
	 * @param roomName 房间名
	 * @param toRoomName 维护的房间名
	 * @param type 1:Harvester 2:Builder
	 * 采取随机维护的方式
	 */
	run: function (creep, roomName, toRoomName, type) {
		// creep.memory.pick = true
		if (creep.memory.pick) {// 去
			if (Game.rooms[roomName] == creep.room) {// 相同房间
				//todo 捡资源
				if (creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {// 装不下
					creep.memory.pick = false
				} else {// 可以装
					var targets = creep.room.find(FIND_DROPPED_RESOURCES);
					if (targets.length > 0) {
						creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
						creep.pickup(targets[0]);
					} else {
						console.log(creep.name + "未发现资源")
						creep.memory.pick = false
					}
				}
			} else {// 不同房间
				const exitDir = creep.room.findExitTo(Game.rooms[roomName]);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {// 回
			if (Game.rooms[roomName] == creep.room) {// 相同房间
				//todo 放资源
				if (creep.store[RESOURCE_ENERGY] == 0) {// 资源放到0了
					creep.memory.pick = true
				}
				if (type == 1) {
					com_comprehensive.harvester(creep, toRoomName)
				} else if (type == 2) {
					com_comprehensive.builder(creep)
				} else {
					console.log("异常1")
				}
			} else {// 不同房间
				const exitDir = creep.room.findExitTo(Game.rooms[toRoomName]);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit,{visualizePathStyle: {stroke: '#ffaa00'}});
			}
		}
	},
	harvester: function (creep, toRoomName) {
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
	},
	builder: function (creep) {
		var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
		if (targets.length > 0) {
			if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
				creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
			}
		} else {
			console.log("没有找到建筑地")
		}
	}
};

module.exports = com_comprehensive;
