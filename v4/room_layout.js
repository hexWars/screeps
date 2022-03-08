const tower = require('structure_tower')
const mount = require('mount')
/**
 *
 */

let room_base = {
	run_1: function (room) {// 布局1
		mount()
		// 塔
		tower.run_1(Game.getObjectById("620d4e8351da53fd9193b024"))
		tower.run_1(Game.getObjectById("62131c91803a815756709de8"))
		// creep

		//todo 化合物采集 修改
		room.keep_creep_num(0, "harvester_hydrogen",
			"5bbcb6f1d867df5e54207c59", room.name,// 化合物
			"621b171f6ed3bb7eb49658f3", room.name,
			"Spawn1", [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY])

		// -----------------------------------------------------------------------------------3
		room.keep_creep_num(2/*2*/, "harvester",
			"5bbcb0469099fc012e63bd95", "E54N11",// 下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1", [WORK, MOVE, WORK, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0459099fc012e63bd8e", "E54N13",// 上面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1", [WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0579099fc012e63bfcc", "E55N11",// 右下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1", [WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0359099fc012e63bbba", "E53N11",// 左下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1", [WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

		// -----------------------------------------------------------------------------------
		room.keep_creep_num(2/*2*/, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0459099fc012e63bd91", room.name,// 本地controller
			"Spawn1", [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY])

		room.keep_creep_num(0, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1", [MOVE, MOVE, MOVE, CARRY, CARRY, WORK])
		// ----------------------------------------------------------------------------------
		room.keep_creep_num(0, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", "E55N12",// 隔壁所有未完成建筑
			"Spawn1", [MOVE, MOVE, MOVE, CARRY, CARRY, WORK])

		room.keep_creep_num(0, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", room.name,// 本地所有未完成建筑
			"Spawn1", [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK])

		// ----------------------------------------------------------------------------1
		room.keep_creep_num(1/*1*/, "defender",
			"no", "E55N12",
			"no", "no",
			"Spawn1", [MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(1/*1*/, "defender",
			"no", "E54N13",
			"no", "no",
			"Spawn1", [MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(1/*1*/, "defender",
			"no", "E54N11",
			"no", "no",
			"Spawn1", [MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(0, "defender",
			"no", "E53N11",
			"no", "no",
			"Spawn1", [MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(1/*1*/, "defender",
			"no", "E55N11",
			"no", "no",
			"Spawn1", [MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		// ----------------------------------------------------------------------------


		// ---------------------------------------------------------------------------------------------------




		room.keep_creep_num(0, "upgrader",
			"62195fad3e5518e3c262de66", "E55N12",// 隔壁container
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1", [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK])
		room.keep_creep_num(2, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", "E54N12",// 所有未完成建筑
			"Spawn1", [MOVE, MOVE, CARRY, CARRY, WORK])

		// ---------------------------------------------------------------------------------------------------
		room.keep_creep_num(1, "carrier",
			"6214c34774b79b01ce90576e", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn1", [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY])

		room.keep_creep_num(1, "harvester",
			"5bbcb0459099fc012e63bd92", room.name,// source地点
			"6214c34774b79b01ce90576e", room.name,// container
			"Spawn1", [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])
		// room.keep_creep_num(1, "harvester",
		// 	"5bbcb0459099fc012e63bd92", room.name,// source地点
		// 	"6214c34774b79b01ce90576e", room.name,// container
		// 	"Spawn1",[WORK, WORK, MOVE, CARRY])

		room.keep_creep_num(0, "collecter",
			"62168f78f5bd4dd5b3738d45", "E57N10",// source地点
			"620ece6391dde3c37a95fe7b", room.name,// container
			"Spawn1", [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY, CARRY])

	},
	run_2: function (room) {
		// 塔
		tower.run_1(Game.getObjectById("62183edc21e04a497120b848"))
		tower.run(Game.getObjectById("621f34e782606abd0fcb5f92"))
		// creep
		room.keep_creep_num(1, "harvester",
			"5bbcb0569099fc012e63bfc8", "E55N12",// source
			"621691e6f6d102d612e2dfc5", "E55N12",// 隔壁container
			"Spawn2", [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY])
		room.keep_creep_num(1, "harvester",
			"5bbcb0569099fc012e63bfc6", "E55N12",// source右上方
			"62195fad3e5518e3c262de66", "E55N12",// 隔壁container
			"Spawn2", [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY])

		room.keep_creep_num(2, "carrier",
			"621691e6f6d102d612e2dfc5", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn2", [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY])
		room.keep_creep_num(2, "carrier",
			"62195fad3e5518e3c262de66", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn2", [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY])
		room.keep_creep_num(0/*2*/, "upgrader",
			"621c39dfae65a2ba81ee5dfb", room.name,// 隔壁storage
			"5bbcb0569099fc012e63bfc7", room.name,// 隔壁controller
			"Spawn2", [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK])


		room.keep_creep_num(0/*2*/, "harvester",
			"5bbcb0579099fc012e63bfcc", "E55N11",// 右下面source地点
			"620ece6391dde3c37a95fe7b", "E54N12",
			"Spawn2", [WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY])
		room.keep_creep_num(0/*2*/, "harvester",
			"5bbcb0579099fc012e63bfca", "E55N11",// 右下面source地点
			"620ece6391dde3c37a95fe7b", "E54N12",
			"Spawn2", [WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY])
		room.keep_creep_num(0/*2*/, "harvester",
			"5bbcb0459099fc012e63bd8e", "E54N13",// 右下面source地点
			"620ece6391dde3c37a95fe7b", "E54N12",
			"Spawn2", [WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY])






		room.keep_creep_num(0, "harvester",
			"5bbcb0569099fc012e63bfc8", "E55N12",// source
			"621691e6f6d102d612e2dfc5", "E55N12",// 隔壁container
			"Spawn2", [WORK, WORK, MOVE, CARRY])

		room.keep_creep_num(0, "builder",
			"62195fad3e5518e3c262de66", room.name,// 本地container
			"no", "E55N12",// 隔壁所有未完成建筑
			"Spawn2", [MOVE, CARRY, WORK])
		//todo 隔壁产生
		room.keep_creep_num(0, "builder",
			"621c39dfae65a2ba81ee5dfb", room.name,// 本地
			"no", room.name,// 隔壁所有未完成建筑
			"Spawn2", [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK])
		//todo 上面

		room.keep_creep_num(0, "repairer",
			"621691e6f6d102d612e2dfc5", "E55N12",
			"no", "E55N12",
			"Spawn2", [MOVE, MOVE, WORK, CARRY, CARRY])



	}

};

module.exports = room_base;
// Game.market.calcTransactionCost("2000", "E34N48", "E54N12")
// Game.market.deal(orderId, amount, [yourRoomName])
//
// Game.rooms["E55N12"].createConstructionSite(, , STRUCTURE_EXTENSION)
// Game.rooms["E55N12"].createConstructionSite(, , STRUCTURE_LINK)
// Game.rooms["E55N12"].createConstructionSite(, , STRUCTURE_RAMPART)
