var initCreeps = {

	/** @param {Creep} Cai **/
	run: function () {
		// 1 清除内存
		// -------------------------------------------------------------------------------------
		for (let name in Memory.creeps) {
			// 还在内存中需要清除
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];
			}
		}

		// -------------------------------------------------------------------------------------
		// 2 creep生产
		// 另一种维持数量的方式: StructureSpawn.renewCreep
		// 每个if第一行调整数量
		let roleName
		let creepsNum
		//------------------------------------------------------------
		roleName = "builder"
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 1) {
			var newName = 'Builder' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, WORK], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------削弱版
		roleName = "harvesterE54N12toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 1) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, WORK], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------增强版
		roleName = "harvesterE54N12toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 1) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, WORK, WORK], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------
		roleName = "harvesterE54N11toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 0) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], newName,
				{memory: {role: roleName}});
		}

		//------------------------------------------------------------
		roleName = "upgraderE54N12toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 0) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, CARRY, MOVE], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------
		roleName = "upgraderE54N11toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 5) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, CARRY, MOVE], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------
		roleName = "upgraderE53N11toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 2) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, CARRY, MOVE], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------
		roleName = "upgraderE53N13toE54N12";
		creepsNum = _.filter(Game.creeps, (creep) => creep.memory.role == roleName);
		if (creepsNum.length < 3) {
			var newName = 'Harvester' + Game.time;
			Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE, CARRY, MOVE], newName,
				{memory: {role: roleName}});
		}
		//------------------------------------------------------------

	}
};

module.exports = initCreeps;
