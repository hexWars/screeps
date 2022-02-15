var roleHarvester = require('study3/tutorial-scripts/section5/role.harvester');
var roleUpgrader = require('study3/tutorial-scripts/section5/role.upgrader');
var roleBuilder = require('study3/tutorial-scripts/section5/role.builder');

// Game.spawns['Spawn1'].spawnCreep( [WORK, CARRY, MOVE], 'Harvester1' );
// Game.creeps['Harvester1'].memory.role = 'harvester';
// Game.creeps['Upgrader1'].memory.role = 'upgrader';
// 激活安全模式: Game.spawns['Spawn1'].room.controller.activateSafeMode();
module.exports.loop = function () {

	var tower = Game.getObjectById('TOWER_ID');
	if (tower) {
		// pos 位置
		// findClosestByRange 查找到该位置线性距离最短的对象
		var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
			filter: (structure) => structure.hits < structure.hitsMax
		});
		if (closestDamagedStructure) {
			// repair 远程维修房间里的任意建筑
			tower.repair(closestDamagedStructure);
		}

		// FIND_HOSTILE_CREEPS 寻找敌对creeps(最近的)
		var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if (closestHostile) {
			tower.attack(closestHostile);
		}
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
