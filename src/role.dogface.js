var roleDogface = {

	/** @param {Creep} creep *
	 */
	run: function (creep) {
		// const targets = creep.room.find(FIND_HOSTILE_CREEPS, {
		// 	filter: function (object) {
		// 		return object.getActiveBodyparts(ATTACK) == 0;
		// 	}
		// });
		const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(target) {
			if(creep.attack(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
		}
	}
};

module.exports = roleDogface;
