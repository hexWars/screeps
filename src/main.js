var rolePosHarvester = require('role.posHarvester');
var rolePosUpgrader = require('role.posUpgrader');
var roleBuilder = require('role.builder');
var initCreeps = require('initcreeps')
var roleDogface = require('role.dogface')
var war = require('war')

// todo 测试挖取分离
var com_harvester = require('com_harvester')
var com_comprehensive = require('com_comprehensive')

var tower = require('tower')


// Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
// Game.creeps['Harvester1'].memory.role = 'harvester';
// Game.creeps['Upgrader1'].memory.role = 'upgrader';
// 激活安全模式: Game.spawns['Spawn1'].room.controller.activateSafeMode();
// src: ['src/*.js']
// Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER ); // 创建塔
// Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_EXTENSION ); // 创建拓展
// Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_ROAD ); // 建路
// findExitTo
// 强大的寻路算法 PathFinder.search
// todo 另一种维持数量的方式: StructureSpawn.renewCreep
// todo 采和运送分离暂时仅限本地,采1个,运送两个,采的需要定位(必须修路),送的必须使用定位然后送回房间
// todo 优先级问题(半解决)
// todo 掉落物品(半解决)
// todo Container 专门储存能量(在建)
// todo 全局捡漏
module.exports.loop = function () {
	console.log("本轮" + Game.time + "-------------------------------------")
	// console.log(Game.resources)
	let com_h_num = 0;
	for (let name in Memory.creeps) {
		// 还在内存中需要清除
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
		}
	}

	// tower.run("620ccdfa3bbc39a25d04bd45")

	initCreeps.run();

	// war.run();

	for (let name in Game.creeps) {
		let creep = Game.creeps[name];

		// 挖取分离----------
		if (creep.memory.role == 'com_E54N12_energy' || "com_harvester_E54N12_47_3835930583" == creep.memory.role) {
			com_harvester.run(creep, "E54N12");
		}
		if (creep.memory.role == 'com_builder_E54N12_E54N12') {
			com_comprehensive.run(creep,"E54N12","E54N12", 2);
		}
		if (creep.memory.role == 'com_harvester_E54N12_E54N12') {
			com_comprehensive.run(creep,"E54N12","E54N12", 1);
		}
		// 挖取分离----------

		if (creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}

		if (creep.memory.role == 'harvesterE54N12toE54N12') {//
			rolePosHarvester.run(creep, "E54N12", "E54N12");
		}
		if (creep.memory.role == 'harvesterE54N11toE54N12') {//
			rolePosHarvester.run(creep, "E54N11", "E54N12");
		}


		if (creep.memory.role == 'upgraderE54N12toE54N12') {//
			rolePosUpgrader.run(creep, "E54N12", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE54N11toE54N12') {//
			rolePosUpgrader.run(creep, "E54N11", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE53N11toE54N12') {//
			rolePosUpgrader.run(creep, "E53N11", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE53N13toE54N12') {//
			rolePosUpgrader.run(creep, "E53N13", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE54N13toE54N12') {//
			rolePosUpgrader.run(creep, "E54N13", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE55N11toE54N12') {//
			rolePosUpgrader.run(creep, "E55N11", Game.rooms["E54N12"].controller);
		}

		// 攻击+++
		if (creep.memory.role == 'dogfaceE54N12') {
			roleDogface.run(creep, "E54N12");
		}
	}
	console.log("Game.cpu.getUsed(): " + Game.cpu.getUsed())
	console.log("tickLimit: " + Game.cpu.tickLimit)
	console.log("bucket: " + Game.cpu.bucket)
}
