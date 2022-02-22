let game_base = require('game_base')
let creep_base = require('creep_base')
let prototype = require('prototype')
let room_layout = require('room_layout')

//role
let role_attacker = require('role_attacker')
let role_builder = require('role_builder')
let role_carrier = require('role_carrier')
let role_defender = require('role_defender')
let role_harvester = require('role_harvester')
let role_occupier = require('role_occupier')
let role_repairer = require('role_repairer')
let role_upgrader = require('role_upgrader')


module.exports.loop = function () {
	console.log("本轮" + Game.time + "----------------------------------------")

	if (Game.time%3 == 0) {
		game_base.gc_name();
	}

	// 塔的逻辑
	// power.run(id1, id2, id3);//todo id有相同原则,相同房间有相同逻辑等

	for (let roomName in Game.rooms) {
		if (roomName == "E54N12") {
			room_layout.run_1(Game.rooms[roomName])
		} else if (roomName == "E55N12") {
			room_layout.run_2(Game.rooms[roomName])
		} else {
			console.log("error room")
		}
	}

	let creep// role, room, targetId
	for (let creepName in Game.creeps) {
		creep = Game.creeps[creepName]
		if (creep.memory.role == "harvester") {// targetId 采集目标
			role_harvester.run(creep)
		} else if (creep.memory.role == "builder") {// 无 ok
			role_builder.run(creep)
		} else if (creep.memory.role == "carrier") {// targetId 转移来源到巢和拓展 ok
			role_carrier.run(creep)
		} else if (creep.memory.role == "defender") {// 无 ok
			role_defender.run(creep)
		} else if (creep.memory.role == "attacker") {// targetId 目标id ok
			role_attacker.run(creep)
		} else if (creep.memory.role == "repairer") {// 维修目标自行选定 ok
			role_repairer.run(creep)
		} else if (creep.memory.role == "upgrader") {// targetId strage的Id
			role_upgrader.run(creep)
		} else {
			creep.say("error")
		}
		if (creep.ticksToLive < 300) {
			// if (creep.memory.role == role && creep.memory.targetId == targetId && creep.memory.spawnId ==spawnId) {
			// 	continue
			// }
			creep_base.creep_new(creep.memory.role, creep.memory.targetId, creep.memory.spawnId, 1, creep.body)
		}
	}
	game_base.basic_glabal_msg();
}
