import {errorMapper} from './modules/errorMapper'
import {mount} from './mount'
import {room_layout_centralization, room_layout_distributed} from './room_layout'
import {harvester} from './role/low/harvester'
import {upgrader} from "./role/low/upgrader";
import {builder} from "./role/low/builder";

export const loop = errorMapper(() => {
	console.log("本轮" + Game.time + "----------------------------------------")

	mount()

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

	//todo 分布式
	let flag = Game.time % 10 == 0

	for (let name in Game.creeps) {
		var creep = Game.creeps[name]
		if (flag) {
			// creep.work()
		}
		if (creep.memory.role == "harvester") {
			harvester(creep)
		} else if (creep.memory.role == "upgrader") {
			upgrader(creep)
		} else if (creep.memory.role == "builder") {
			builder(creep)
		}
	}


	console.log("tickLimit: " + Game.cpu.tickLimit + " bucket: " + Game.cpu.bucket)
	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}
})
