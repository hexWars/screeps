
let room_layout = require('room_layout')

//role
let harvester_to_up = require('harvester_to_up')

// import "./move"


// const HelperRoomResource = require('helper_roomResource')
// HelperRoomResource.showAllRes();

module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------")

	if (Game.time % 5 == 0) {
		for (let name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];// 清除内存
			}
		}
	}

	// 塔的逻辑
	// power.run(id1, id2, id3);//todo id有相同原则,相同房间有相同逻辑等

	for (let roomName in Game.rooms) {
		if (roomName == "W36S41") {
			room_layout.run_1(Game.rooms[roomName])
		}
	}

	let creep// role, room, targetId
	for (let creepName in Game.creeps) {
		creep = Game.creeps[creepName]
		if (creep.memory.role == "harvester_to_up") {
			harvester_to_up.run(creep)
		}
	}
	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}

}
