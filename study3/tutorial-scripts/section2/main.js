var roleHarvester = require('study3/tutorial-scripts/section2/role.harvester');
var roleUpgrader = require('study3/tutorial-scripts/section2/role.upgrader');

module.exports.loop = function () {

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if (creep.memory.role == 'upgrader') {
			roleUpgrader.run(creep);
		}
	}
}
