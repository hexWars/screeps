var creep_base = require('creep_base')
var roleDogface = {

	/** @param {Creep} creep *
	 * @param roomName 守护房间名
	 */
	run: function (creep, roomName) {
		// const targets = creep.room.find(FIND_HOSTILE_CREEPS, {
		// 	filter: function (object) {
		// 		return object.getActiveBodyparts(ATTACK) == 0;
		// 	}
		// });
		if (creep_base.creep_to_room(creep, roomName)) {
			var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
			if(target) {
				if(creep.attack(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
				}
			} else {
				target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
				if (target) {
					if(creep.attack(target) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
					}
				} else {
					creep.moveTo(31,32)
				}

			}
		}
		// if (creep.room == Game.rooms[roomName]) {
		// 	const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		// 	if(target) {
		// 		if(creep.attack(target) == ERR_NOT_IN_RANGE) {
		// 			creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
		// 		}
		// 	} else {
		// 		creep.moveTo(32,35, {visualizePathStyle: {stroke: '#ffaa00'}})
		// 	}
		// } else {
		// 	const exitDir = creep.room.findExitTo(Game.rooms[roomName]);// 找到通往另一个房间的出口方向
		// 	const exit = creep.pos.findClosestByRange(exitDir);// 查找到该位置线性距离最短的对象
		// 	creep.moveTo(exit, {visualizePathStyle: {stroke: '#ffaa00'}});
		// }

	}
};

module.exports = roleDogface;
