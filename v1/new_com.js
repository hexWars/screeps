var new_com = {

	/** @param {Creep} creep **/
	run: function (creep) {
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == "com_E54N12_energy");
		if (creepsNum < 1) {
			if (creep.store.getFreeCapacity() > 49) {
				// var target = Game.rooms[toRoomName]
			} else {
				var target = Game.rooms[toRoomName].find(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_STORAGE;
					}
				});
				if (target.length > 0) {
					if (creep.withdraw(target[0]) == ERR_NOT_IN_RANGE) {
						creep.moveTo(target[0], {visualizePathStyle: {stroke: '#ffffff'}});
					}
				}
			}

		}
	}
};

module.exports = new_com;
