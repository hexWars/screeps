const prototype = require('prototype')
/**
 *
 */

let room_base = {
	run_1: function (room) {// 布局1
		prototype()

		// -----------------------------------------------------------------------------------3
		room.keep_creep_num(1/*2*/, "harvester_to_up",
			"5bbcab079099fc012e632a7d", room.name,// 下面source地点
			"5bbcab079099fc012e632a7c", room.name,
			"Spawn1", [WORK, MOVE, MOVE, CARRY])

	},
	run_2: function (room) {


	}

};

module.exports = room_base;
// Game.market.calcTransactionCost("2000", "E34N48", "E54N12")
// Game.market.deal(orderId, amount, [yourRoomName])
//
