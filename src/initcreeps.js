var initCreeps = {

	/** @param {Creep} Cai **/
	run: function (creep) {
		// 1 清除内存
		for (var name in Memory.creeps) {
			// 还在内存中需要清除
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];
				console.log('Clearing non-existing creep memory:', name);
			}
		}

		// 2 harvesters,upgraders,builders生产
		let creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
		let harvesterNum = 0;
		let upgraderNum = 4;
		let builderNum = 0;
		// 另一种维持数量的方式: StructureSpawn.renewCreep
		if (creepsNum.length < harvesterNum) {
			// Game.time 系统游戏 tick 计数
			var newName = 'Harvester' + Game.time;
			console.log('Spawning new harvester: ' + newName);
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
				{memory: {role: 'harvester'}});
		}

		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
		if (creepsNum.length < upgraderNum) {
			var newName = 'Upgrader' + Game.time;
			console.log('Spawning new upgraders: ' + newName);
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
				{memory: {role: 'upgrader'}});
		}

		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
		if (creepsNum.length < builderNum) {
			var newName = 'Builder' + Game.time;
			console.log('Spawning new builders: ' + newName);
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
				{memory: {role: 'builder'}});
		}
	}
};

module.exports = initCreeps;
