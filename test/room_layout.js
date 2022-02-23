const creep_base = require("creep_base");
const tower = require('structure_tower')
const prototype = require('prototype')
/**
 *
 */

let room_base = {

	/**
	 *
	 */
	run_1: function (room) {// 布局1
		prototype()
		//塔
		tower.run(Game.getObjectById("620d4e8351da53fd9193b024"))
		tower.run(Game.getObjectById("62131c91803a815756709de8"))


		//todo 检查creep
		//todo 想一个办法把信息录入队列,并且更改索引值?因为需要具体查看情况

		room.keep_creep_num(1, "carrier",
			"6214c34774b79b01ce90576e", room.name,// container
			"no", room.name,// fillSpawnEnergy
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, CARRY])

		room.keep_creep_num(1, "harvester",
			"5bbcb0459099fc012e63bd92", room.name,// source地点
			"6214c34774b79b01ce90576e", room.name,// container
			"Spawn1",[WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY])

		room.keep_creep_num(1, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0459099fc012e63bd91", room.name,// controller
			"Spawn1",[WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY])

		room.keep_creep_num(1, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, WORK])

		room.keep_creep_num(1, "upgrader",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"5bbcb0569099fc012e63bfc7", "E55N12",// 隔壁controller
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, WORK])

		room.keep_creep_num(1, "builder",
			"620ece6391dde3c37a95fe7b", room.name,// 本地storage
			"no", "E55N12",// 隔壁所有未完成建筑
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, WORK])



	},
	run_2: function (room) {

	}

};

module.exports = room_base;
