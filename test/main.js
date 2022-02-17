let game_prototype = require('game_prototype')
let creep_base = require('creep_base')
let com_harvester = require('com_harvester')


module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------")

	for (let name in Memory.creeps) {
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];// 清除内存
		}
	}
	// 塔的逻辑
	power.run(Game.rooms["roomName"]);//todo 房间里所有塔有相同职责


	let s_creeps = []
	let sign = 3;//多少优先级
	let creep
	for (let i=0; i<sign; i++) { s_creeps.push([]) }
	for (let name in Memory.creeps) {
		// creep, 物品, roomName, [地点], [opts], toRoomName ,[地点], [opts]
		// 地点: 优先级:spawn>extension>tower>
		creep = Game.creeps[name]
		if (creep.memory.role == "E54N12_地点_") {
			// 采运分离的运
			com_harvester.run()
			role.run(creep, "roomName", ["地点"], ["harvester"],
				"toRoomName", [""]);
		}

	}

	game_prototype.basic_glabal_msg();
}
