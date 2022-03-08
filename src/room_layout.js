import {mount} from "./mount";
import {config} from "./config";




/**
 * 分布式
 * @type {{layout: room_layout_distributed.layout}}
 */
export const room_layout_distributed = {
	layout: function (roomName) {
		mount()
		let room = Game.rooms[roomName]
		let level = room.controller.level
		let roomJson = config[roomName]

		//todo 有两套方案,计数形式和分布式,计数式隔1h1次



		// Game.spawns[].spawnCreep(body, name, {
		// 	memory:
		// 		{
		// 			role: role,
		// 			selfId: selfId,
		// 			selfRoomName: selfRoomName,
		// 			targetId: targetId,
		// 			targetRoomName: targetRoomName,
		// 			spawnName: spawnName
		// 		}
		// })
	}
}

/**
 * 集中式
 * @type {{layout: room_layout_centralization.layout}}
 */
export const room_layout_centralization = {
	layout: function (roomName) {
		mount()
		let room = Game.rooms[roomName]
		// let level = room.controller.level
		let roomJson = config[roomName]

		for (let role in roomJson) {
			room.keep_creep_num(roomJson[role].number, roomJson[role].role,
				roomJson[role].selfId, roomJson[role].selfRoomName,
				roomJson[role].targetId, roomJson[role].targetRoomName,
				roomJson[role].spawnName, roomJson[role].body)
		}

	}
}

