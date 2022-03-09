import {errorMapper} from './modules/errorMapper'
import {mount} from './mount'
import {room_layout_centralization, room_layout_distributed} from './room_layout'
import {role_harvester} from "./role/medium/role_harvester";
import {role_upgrader} from "./role/medium/role_upgrader";
import {role_builder} from "./role/medium/role_builder";
import {role_carrier} from "./role/medium/role_carrier";

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

	// if (Game.time % 500 == 0) {
	// 	for (let roomName in Game.rooms) {
	// 		room_layout_centralization.layout(roomName)
	// 	}
	// } else {
	// 	for (let roomName in Game.rooms) {
	// 		room_layout_distributed.layout(roomName)
	// 	}
	// }

	for (let roomName in Game.rooms) {
		room_layout_centralization.layout(roomName)
	}

	Game.getObjectById("622815f682606a45aacde400").run_1()

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
		}
	}


	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}
})

//todo 更改步入第二阶段, 从container取出
