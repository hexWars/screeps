let game_prototype = require('game_prototype')
let creep_base = require('creep_base')
let com_harvester = require('com_harvester')
let room_prototype = require('room_prototype')


module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------")

	if (Game.time%3 == 0) {
		game_prototype.gc_name();
	}

	// 塔的逻辑
	// power.run(id1, id2, id3);//todo id有相同原则,相同房间有相同逻辑等

	let room
	for (let roomName in Game.rooms) {
		if (roomName == "E54N12") {
			room = Game.rooms[roomName]
			room_prototype.run_1(room)
		} else if (roomName == "E54N12") {

		}

	}



	game_prototype.basic_glabal_msg();
}
