var roleVesselBuilder = {

	/** @param {Creep} creep *
	 * @param roomName 目标房间名
	 */
	run: function (creep, roomName) {

		if (creep.store.getFreeCapacity() > 0) {
			if (creep.room == Game.rooms[roomName]) {
				var targets = Game.rooms[roomName].find(FIND_STRUCTURES, {//todo 这里roomName可能要改
					filter: (structure) => {
						// 母巢,拓展,塔,小容器,大容器
						return (
								structure.structureType== STRUCTURE_CONTAINER
								) &&
							structure.store.getCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				if (targets.length > 0) {
					console.log("找到")
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
					creep.pickup(targets[0])
				} else {
					console.log("未找到")
				}
			}
			 else {
				const exitDir = creep.room.findExitTo(Game.rooms[roomName]);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			var targets = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
			if (targets.length > 0) {
				if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
				} else {
					console.log("error")
				}
			} else {
				console.log("无目标")
			}
		}

	}
};

module.exports = roleVesselBuilder;
