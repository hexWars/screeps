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
		// creep_base.creep_new("harvester",// 本地
		// 	"5bbcb0459099fc012e63bd92", "Spawn1",
		// 	0, [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])

		// targetId是container,逻辑里面直接fillSpawnEnergy
		room.keep_creep_num(1, "carrier",
			"6214c34774b79b01ce90576e", room.name,
			"no", room.name,
			"Spawn1",[MOVE, MOVE, MOVE, CARRY, CARRY, CARRY])
		creep_base.creep_new("carrier",
			"6214c34774b79b01ce90576e", "Spawn1",
			1, [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY])

		//
		room.keep_creep_num(1,
			"carrier",
			"6214c34774b79b01ce90576e", room.name,
			"Spawn1", [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY])
		creep_base.creep_new("harvester",// 本地
			"5bbcb0459099fc012e63bd92", "Spawn1",
			1, [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY])


		creep_base.creep_new("upgrader",// 本地
			"620ece6391dde3c37a95fe7b", "Spawn1",
			1, [MOVE, MOVE, MOVE, CARRY, CARRY, WORK])

		creep_base.creep_new("builder",// 右边
			"620ece6391dde3c37a95fe7b", "Spawn1",
			1, [MOVE, MOVE, MOVE, CARRY, CARRY, WORK])



		// creep_base.creep_new("harvester",// 上
		// 	"5bbcb0459099fc012e63bd8e", "Spawn1",
		// 	1, [WORK, MOVE, MOVE, MOVE, CARRY, CARRY])
		// creep_base.creep_new("harvester",// 下右
		// 	"5bbcb0579099fc012e63bfcc", "Spawn1",
		// 	0, [WORK, MOVE, MOVE, CARRY, CARRY])
		// creep_base.creep_new("harvester",// 下
		// 	"5bbcb0469099fc012e63bd95", "Spawn1",
		// 	0, [WORK, MOVE, MOVE, CARRY, CARRY])
		// creep_base.creep_new("harvester",// 下左
		// 	"5bbcb0359099fc012e63bbba", "Spawn1",
		// 	0, [WORK, MOVE, MOVE, CARRY, CARRY])

	},
	run_2: function (room) {

	}

};

module.exports = room_base;
