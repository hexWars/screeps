const tower = require('structure_tower')
const prototype = require('prototype')
/**
 *
 */

let room_base = {
	run_1: function (room) {// 布局1
		prototype()
		// 塔
		tower.run(Game.getObjectById("620d4e8351da53fd9193b024"))
		tower.run(Game.getObjectById("62131c91803a815756709de8"))
		// creep


		// -----------------------------------------------------------------------------------3
		room.keep_creep_num(3, "harvester",
			"5bbcb0469099fc012e63bd95", "E54N11",// 下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1",[WORK, MOVE, WORK, MOVE, MOVE, MOVE, CARRY, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0459099fc012e63bd8e", "E54N13",// 上面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1",[WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0579099fc012e63bfcc", "E55N11",// 右下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1",[WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "harvester",
			"5bbcb0359099fc012e63bbba", "E53N11",// 左下面source地点
			"620ece6391dde3c37a95fe7b", room.name,
			"Spawn1",[WORK, MOVE, MOVE, MOVE, CARRY, CARRY])

        // -----------------------------------------------------------------------------------
		room.keep_creep_num(2, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0459099fc012e63bd91", room.name,// 本地controller
			"Spawn1",[WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])

		room.keep_creep_num(0, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, WORK])
		// ----------------------------------------------------------------------------------
		room.keep_creep_num(0, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", "E55N12",// 隔壁所有未完成建筑
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, WORK])

		room.keep_creep_num(0, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", room.name,// 本地所有未完成建筑
			"Spawn1",[MOVE, MOVE, CARRY, CARRY, WORK, WORK])

		// ----------------------------------------------------------------------------1
		room.keep_creep_num(1, "defender",
			"no", "E55N12",
			"no", "no",
			"Spawn1",[MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(0, "defender",
			"no", "E54N13",
			"no", "no",
			"Spawn1",[MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(0, "defender",
			"no", "E54N11",
			"no", "no",
			"Spawn1",[MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(0, "defender",
			"no", "E53N11",
			"no", "no",
			"Spawn1",[MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		room.keep_creep_num(0, "defender",
			"no", "E55N11",
			"no", "no",
			"Spawn1",[MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, ATTACK])
		// ----------------------------------------------------------------------------



		// ---------------------------------------------------------------------------------------------------
		room.keep_creep_num(1, "harvester",
			"5bbcb0569099fc012e63bfc8", "E55N12",// source
			"621691e6f6d102d612e2dfc5", "E55N12",// 隔壁container
			"Spawn1",[WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY])
		room.keep_creep_num(1, "upgrader",
			"621691e6f6d102d612e2dfc5", "E55N12",// 隔壁container
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK])
		room.keep_creep_num(0, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", "E55N12",// 所有未完成建筑
			"Spawn1",[MOVE, MOVE, CARRY, CARRY, WORK, WORK])

		// ---------------------------------------------------------------------------------------------------
		room.keep_creep_num(1, "carrier",
			"6214c34774b79b01ce90576e", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn1",[MOVE, MOVE, CARRY, CARRY, CARRY, CARRY])

		room.keep_creep_num(1, "harvester",
			"5bbcb0459099fc012e63bd92", room.name,// source地点
			"6214c34774b79b01ce90576e", room.name,// container
			"Spawn1",[WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])
		// room.keep_creep_num(1, "harvester",
		// 	"5bbcb0459099fc012e63bd92", room.name,// source地点
		// 	"6214c34774b79b01ce90576e", room.name,// container
		// 	"Spawn1",[WORK, WORK, WORK, WORK, MOVE, CARRY])

	},
	run_2: function (room) {
		room.keep_creep_num(0, "upgrader",
			"621691e6f6d102d612e2dfc5", room.name,// 隔壁container
			"5bbcb0569099fc012e63bfc7", room.name,// 隔壁controller
			"Spawn2",[MOVE, CARRY, WORK, WORK])

		room.keep_creep_num(0, "harvester",
			"5bbcb0569099fc012e63bfc8", "E55N12",// source
			"621691e6f6d102d612e2dfc5", "E55N12",// 隔壁container
			"Spawn2",[WORK, WORK, MOVE, CARRY])
		room.keep_creep_num(0, "repairer",
			"621691e6f6d102d612e2dfc5", "E55N12",
			"no", "E55N12",
			"Spawn2",[MOVE, MOVE, WORK, MOVE, CARRY])
		room.keep_creep_num(0, "builder",
			"621691e6f6d102d612e2dfc5", room.name,// 本地container
			"no", "E55N12",// 隔壁所有未完成建筑
			"Spawn2",[MOVE, MOVE, CARRY, CARRY, WORK])
		room.keep_creep_num(0, "carrier",
			"621691e6f6d102d612e2dfc5", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn2",[MOVE, MOVE, CARRY, CARRY, CARRY, CARRY])

		room.keep_creep_num(3, "harvester",
			"5bbcb0579099fc012e63bfcc", "E55N11",// 右下面source地点
			"620ece6391dde3c37a95fe7b", "E54N12",
			"Spawn2",[WORK, WORK, MOVE, CARRY])

	}
	// creep.moveTo(target, { reusePath: 50 })
};

module.exports = room_base;
