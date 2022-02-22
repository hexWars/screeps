var role_repair_road = {

	/** @param {Creep} creep *
	 * @param roomName 目标房间名
	 */
	run: function (creep, roomName) {

		if (creep.store.getFreeCapacity() > 0) {
			if (creep.room == Game.rooms[roomName]) {
				var targets = creep.room.find(FIND_DROPPED_RESOURCES);
				if (targets.length > 0) {
					creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffaa00'}});
					creep.pickup(targets[0]);
				} else {
					console.log(creep.name + "未发现资源")
				}
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
					if(object.hits > object.hitsMax / 3 * 2) {
						return false;
					}
					return true;
				}
			});
			if (creep.repair(target) === ERR_NOT_IN_RANGE) {
				creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
			}
		}

	}
};

module.exports = role_repair_road;
