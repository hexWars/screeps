import {mount} from "./mount";
import {config} from "./config";

/**
 * 房间运行
 * @type {{}}
 */
export const setting_room_layout = {
	/**
	 * 执行设置
	 * @param roomName
	 */
	run: function (roomName) {
		this.creep_centralization(roomName)
		//todo 根据配置文件执行
		this.structure_load(roomName)
	},
	structure_load: function (roomName) {
		let room = Game.rooms[roomName]
		let level = room.controller.level
		let roomConfig = config[roomName]
		//todo Link和塔
		this.towerConfig(roomConfig["structures"].Tower)
		// this.linkConfig(roomConfig["structures"].Link)
		//todo 捡起
		this.pick_sources(room)
	},
	/**
	 * 捡起所有掉落资源
	 * @param room
	 */
	pick_sources: function (room) {
		var targets = room.find(FIND_DROPPED_RESOURCES)
		if (targets.length > 0) {
			for (let i=0; i<targets.length; i++) {
				var creep = targets[i].pos.findInRange(FIND_MY_CREEPS, 1)[0]
				if (creep) {
					creep.pickup(targets[i])
				}
			}
		} else {
			targets = room.find(FIND_TOMBSTONES)
			for (let i=0; i<targets.length; i++) {
				creep = targets[i].pos.findInRange(FIND_MY_CREEPS, 1)[0]
				if (creep) {
					creep.withdraw(targets[i], RESOURCE_ENERGY)
				}
			}
		}
	},
	/**
	 * 根据配置执行塔逻辑
	 * @param towerConfig
	 */
	towerConfig: function (towerConfig) {
		// 攻击
		for (let towerId in towerConfig.attack) {
			console.log(towerId)
			Game.getObjectById(towerId).run_attack()
		}
		// 维修
		for (let towerId in towerConfig.repair) {
			var range = towerConfig.repair[towerId]
			Game.getObjectById(towerId).run_range(range)
		}
	},
	/**
	 * 分布式
	 */
	creep_distributed: function (roomName) {
		mount()
		let room = Game.rooms[roomName]
		let level = room.controller.level
		let roomConfig = config[roomName]
		let spawn

		//todo 有两套方案,计数形式和分布式,计数式隔1h1次

		for (let spawnName in Game.spawns) {
			spawn = Game.spawns[spawnName]
			spawn.work()
		}
	},
	/**
	 * 集中式
	 * @param roomName
	 */
	creep_centralization: function (roomName) {
		mount()
		let room = Game.rooms[roomName]
		// let level = room.controller.level
		let roomConfig = config[roomName]

		for (let role in roomConfig) {
			room.keep_creep_num(roomConfig[role].number, roomConfig[role].role,
				roomConfig[role].selfId, roomConfig[role].selfRoomName,
				roomConfig[role].targetId, roomConfig[role].targetRoomName,
				roomConfig[role].spawnName, roomConfig[role].body)
		}
	}
}

