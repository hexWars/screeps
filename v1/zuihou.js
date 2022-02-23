var zui = {

	/** @param {Creep} creep *
	 */
	run: function (creep) {

		if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {

			creep.moveTo(new RoomPosition(14, 42, 'E55N12'))
			// creep.moveTo(Game.rooms["E55N12"].controller)
		}

	}
};

module.exports = zui;
