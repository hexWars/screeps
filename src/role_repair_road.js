var role_repair_road = {

	/** @param {Creep} creep *
	 * @param roomName 目标房间名
	 */
	run: function (creep, roomName) {

		if (creep.store.getFreeCapacity() > 0) {
			if (creep.room == Game.rooms[roomName]) {
				var targets = Game.rooms[roomName].find(FIND_STRUCTURES, {//todo 这里roomName可能要改
					filter: (structure) => {
						// 母巢,拓展,小容器,大容器
						return (
								structure.structureType == STRUCTURE_EXTENSION ||
								structure.structureType == STRUCTURE_SPAWN ||
								structure.structureType == STRUCTURE_STORAGE ||
								structure.structureType== STRUCTURE_CONTAINER
							) &&
							structure.store.getCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			} else {
				const exitDir = creep.room.findExitTo(Game.rooms[roomName]);// 找到通往另一个房间的出口方向
				const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
				creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
			}
		} else {
			var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: function(object){
					if(object.structureType != STRUCTURE_ROAD ) {
						return false;
					}
					if(object.hits > object.hitsMax / 3) {
						return false;
					}
					return true;
				}
			});
			if (target) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
				creep.repair(target);
			} else {
				console.log("无目标")
			}
		}

	}
};

module.exports = role_repair_road;
