const com_harvester = require("./com_harvester");

/**
 *
 */

let room_base = {

	/**
	 *
	 */
	run_1: function (room) {// 布局1
		//todo 分离的话


		let s_creeps = []
		let sign = 3;//多少优先级
		let creep
		for (let i=0; i<sign; i++) { s_creeps.push([]) }//todo 想一个办法把信息录入队列,并且更改索引值?因为需要具体查看情况
		for (let name in Memory.creeps) {
			// creep, 物品, roomName, [地点], [opts], toRoomName ,[地点], [opts]
			// 地点: 优先级:spawn>extension>tower>
			creep = Game.creeps[name]
			if (creep.memory.role == "E54N12_地点_") {
				// 采运分离的运
				com_harvester.run(creep,"E54N12", "E54N12")
				role.run(creep, "roomName", ["地点"], ["harvester"],
					"toRoomName", [""]);
			}

		}
	}

};

module.exports = room_base;
