import {errorMapper} from './modules/errorMapper'

import {harvester} from "./role/harvester";
import {upgrader} from "./role/upgrader";
import {builder} from "./role/builder";
import {carrier} from "./role/carrier"
import {view} from "./view";
import {picker} from "./role/picker";
// import {} from "./prototype/prototype.Creep.move"

export const loop = errorMapper(() => {

	if (Game.time % 5 == 0) {
		for (let name in Memory.creeps) {
			if (!Game.creeps[name]) {
				delete Memory.creeps[name];// 清除内存
			}
		}
	}

	var pickers = _.filter(Game.creeps, (creep) => creep.memory.role == 'picker');

	if(pickers.length < 10) {
		let newName = 'pickers' + Game.time;
		console.log('Spawning new pickers: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([
				WORK, WORK, WORK, WORK
				, CARRY, CARRY, CARRY, CARRY
				, MOVE, MOVE, MOVE, MOVE
			], newName,
			{memory: {role: 'picker'}});
	}

	var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

	if(upgraders.length < 1) {
		let newName = 'Upgraders' + Game.time;
		console.log('Spawning new upgraders: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([
				WORK, WORK, WORK, WORK
				, CARRY, CARRY, CARRY, CARRY
				, MOVE, MOVE, MOVE, MOVE
			], newName,
			{memory: {role: 'upgrader'}});
	}

	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

	if(harvesters.length < 5) {
		let newName = 'Harvester' + Game.time;
		console.log('Spawning new harvester: ' + newName);
		Game.spawns['Spawn1'].spawnCreep([
				WORK, WORK, WORK, WORK
				, CARRY, CARRY, CARRY, CARRY
				, MOVE, MOVE, MOVE, MOVE
			], newName,
			{memory: {role: 'harvester'}});
	}
	console.log("现在harvester的数量为：" + harvesters.length)



	for (let name in Game.creeps) {
		var creep = Game.creeps[name]
		if (creep.memory.role == "harvester") {
			harvester(creep)
		} else if (creep.memory.role == "upgrader") {
			upgrader(creep)
		} else if (creep.memory.role == "builder") {
			builder(creep)
		} else if (creep.memory.role == "carrier") {
			carrier(creep)
		} else if (creep.memory.role == "picker") {
			picker(creep)
		} else{
			console.log("error")
		}
	}

	if (Game.cpu.bucket === 10000) {
		Game.cpu.generatePixel();
	}


	global.view = view
})

