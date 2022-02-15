var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var initCreeps = require('initcreeps')
var roleButtomUpgrader = require('role.buttomupgrader')

// Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
// Game.creeps['Harvester1'].memory.role = 'harvester';
// Game.creeps['Upgrader1'].memory.role = 'upgrader';
// 激活安全模式: Game.spawns['Spawn1'].room.controller.activateSafeMode();
// src: ['src/*.js']
// Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER ); // 创建塔
// Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_EXTENSION ); // 创建拓展
// findExitTo

module.exports.loop = function () {

	initCreeps.run();

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if (creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
		if (creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
		if (creep.memory.role == 'buttom') {
			roleButtomUpgrader.run(creep)
		}
	}
}
