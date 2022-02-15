var roleHarvester = require('role.posHarvester');
var roleUpgrader = require('role.posUpgrader');
var roleBuilder = require('role.builder');
var initCreeps = require('initcreeps')
var war = require('war')

var roleButtomUpgrader = require('role.buttomupgrader')

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

module.exports.loop = function () {

	initCreeps.run();
	// war.run();

	for (let name in Game.creeps) {
		let creep = Game.creeps[name];
		// const target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
		// if (target) {
		// 	if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
		// 		creep.moveTo(target);
		// 	}
		// }
		if (creep.memory.role == 'harvester') {// 删除
			roleHarvester.run(creep, "E54N12", "E54N12");
		}
		if (creep.memory.role == 'upgrader') {// 删除
			roleUpgrader.run(creep, "E54N12", creep.room.controller);
		}
		if (creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
		if (creep.memory.role == 'buttom') {// 删除
			roleButtomUpgrader.run(creep)
		}

		if (creep.memory.role == 'harvesterE54N12toE54N12') {//
			roleHarvester.run(creep, "E54N12", "E54N12");
		}
		if (creep.memory.role == 'harvesterE54N11toE54N12') {//
			roleHarvester.run(creep, "E54N11", "E54N12");
		}


		if (creep.memory.role == 'upgraderE54N12toE54N12') {//
			roleUpgrader.run(creep, "E54N12", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE54N11toE54N12') {//
			roleUpgrader.run(creep, "E54N11", Game.rooms["E54N12"].controller);
		}
		if (creep.memory.role == 'upgraderE53N11toE54N12') {//
			roleUpgrader.run(creep, "E53N11", Game.rooms["E54N12"].controller);
		}
	}

}
