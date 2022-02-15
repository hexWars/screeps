var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var initCreeps = require('initcreeps')

// Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
// Game.creeps['Harvester1'].memory.role = 'harvester';
// Game.creeps['Upgrader1'].memory.role = 'upgrader';
// 激活安全模式: Game.spawns['Spawn1'].room.controller.activateSafeMode();
// src: ['src/*.js']
module.exports.loop = function () {

	for (var name in Memory.creeps) {
		// 还在内存中需要清除
		if (!Game.creeps[name]) {
			delete Memory.creeps[name];
			console.log('Clearing non-existing creep memory:', name);
		}
	}

	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
	console.log('Harvesters: ' + harvesters.length);

	// 另一种维持数量的方式: StructureSpawn.renewCreep
	if (harvesters.length < 0) {
		// 系统游戏 tick 计数
		var newName = 'Harvester' + Game.time;
		console.log('Spawning new harvester: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
			{memory: {role: 'harvester'}});
	}

	var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
	console.log('upgraders: ' + upgraders.length);

	// 另一种维持数量的方式: StructureSpawn.renewCreep
	if (upgraders.length < 4) {
		// 系统游戏 tick 计数
		var newName = 'Upgrader' + Game.time;
		console.log('Spawning new upgraders: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
			{memory: {role: 'upgrader'}});
	}

	var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
	console.log('Harvesters: ' + harvesters.length);

	// 另一种维持数量的方式: StructureSpawn.renewCreep
	if (builders.length < 0) {
		// 系统游戏 tick 计数
		var newName = 'Builder' + Game.time;
		console.log('Spawning new builders: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
			{memory: {role: 'builder'}});
	}

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
	}
}
