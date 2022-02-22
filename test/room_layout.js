const creep_base = require("creep_base");

/**
 *
 */

let room_base = {

	/**
	 *
	 */
	run: function (room) {// 布局1
		//todo 检查creep
		//todo 想一个办法把信息录入队列,并且更改索引值?因为需要具体查看情况
		creep_base.creep_new("harvester",// 本地
			"5bbcb0459099fc012e63bd92", "620a6a5af82b57ef1a4ca0e8",
			1, [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])
		creep_base.creep_new("carrier",// 从container到容器
			"6214a8739d5b473a6ee78bdf", "620a6a5af82b57ef1a4ca0e8",
			2, [WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY])

		creep_base.creep_new("harvester",// 上
			"5bbcb0459099fc012e63bd8e", "620a6a5af82b57ef1a4ca0e8",
			4, [WORK, MOVE, MOVE, CARRY, CARRY])
		creep_base.creep_new("harvester",// 下右
			"5bbcb0579099fc012e63bfcc", "620a6a5af82b57ef1a4ca0e8",
			4, [WORK, MOVE, MOVE, CARRY, CARRY])
		creep_base.creep_new("harvester",// 下
			"5bbcb0469099fc012e63bd95", "620a6a5af82b57ef1a4ca0e8",
			4, [WORK, MOVE, MOVE, CARRY, CARRY])
		creep_base.creep_new("harvester",// 下左
			"5bbcb0359099fc012e63bbba", "620a6a5af82b57ef1a4ca0e8",
			4, [WORK, MOVE, MOVE, CARRY, CARRY])


	}

};

module.exports = room_base;
