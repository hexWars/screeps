const prototype = require("./prototype");

let role = {
	/**
	 *
	 * @param creep
	 */
	run: function (creep) {
		prototype()

		if (creep.room == Game.rooms["E59N12"]) {
			if (creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) {
				// creep.moveTo(new RoomPosition(14, 42, 'E59N12'))
				// creep.moveTo(Game.rooms["E59N12"].controller)
				creep.signController(Game.rooms["E59N12"].controller, "Bug fixes")
			}
		} else {
			creep.to_room("E59N12")
		}
		if(creep.signController(creep.room.controller, "Bug fixes") == ERR_NOT_IN_RANGE) {
			creep.moveTo(creep.room.controller);
		}




	}
}

module.exports = role;
