var roleHarvester = require('study3/tutorial-scripts/section3/role.harvester');
var roleBuilder = require('study3/tutorial-scripts/section3/role.builder');

module.exports.loop = function () {

	for (var name in Game.rooms) {
		console.log('Room "' + name + '" has ' + Game.rooms[name].energyAvailable + ' energy');
	}

	for (var name in Game.creeps) {
		var creep = Game.creeps[name];
		if (creep.memory.role == 'harvester') {
			roleHarvester.run(creep);
		}
		if (creep.memory.role == 'builder') {
			roleBuilder.run(creep);
		}
	}
}
