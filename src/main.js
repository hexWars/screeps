import {errorMapper} from './modules/errorMapper'
import {mount} from './mount'
import {room_layout_centralization, room_layout_distributed, setting_room_layout} from './room_layout'
import {role_harvester} from "./role/medium/role_harvester";
import {role_upgrader} from "./role/medium/role_upgrader";
import {role_builder} from "./role/medium/role_builder";
import {role_carrier} from "./role/medium/role_carrier";
import {roleCenter} from "./role/high/role.centerCreep";

export const loop = errorMapper(() => {
	console.log("本轮" + Game.time + "----------------------------------------")

	mount()

	if (Game.time % 5 == 0) {
		for (let name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];// 清除内存
			}
		}
	}



	// if (Game.time % 500 == 0) {// 分布式示例
	// 	for (let roomName in Game.rooms) {
	// 		room_layout_centralization.layout(roomName)
	// 	}
	// } else {
	// 	for (let roomName in Game.rooms) {
	// 		room_layout_distributed.layout(roomName)
	// 	}
	// }

	for (let roomName in Game.rooms) {
		setting_room_layout.run(roomName)
		// room_layout_centralization.layout(roomName)
		// let num = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {// 开启安全模式
		// 	filter: function (obj) {
		// 		return obj.structureType === STRUCTURE_EXTENSION
		// 	}
		// })
		// if (num < 15) {
		// 	Game.rooms[roomName].controller.activateSafeMode()
		// }
	}

	//tower
	Game.getObjectById("622815f682606a45aacde400").run_1()
	Game.getObjectById("622abfe68d3e7624f42731e0").run_attack()

	// 把查看身边的资料可否捡起来

	//todo 分布式
	let flag = Game.time % 10 == 0

	// let roleMap
	// roleMap["harvester"] = harvester

	for (let name in Game.creeps) {
		var creep = Game.creeps[name]
		if (flag) {
			// creep.work()
		}
		if (creep.memory.role == "harvester") {
			role_harvester(creep)
		} else if (creep.memory.role == "upgrader") {
			role_upgrader(creep)
		} else if (creep.memory.role == "builder") {
			role_builder(creep)
		} else if (creep.memory.role == "carrier") {
			role_carrier(creep)
		} else if (creep.memory.role == "center") {
			roleCenter(creep)
		}
	}


	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}
})

//todo 更改步入第二阶段, 从container取出
