import memory from "@/modules/memory";
import {Config} from "@/config"

export class roleBuilder {

	/** @param {Creep} creep **/
	static run(creep: Creep) {

		if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.building = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.building && creep.store.getFreeCapacity() == 0) {
			creep.memory.building = true;
			creep.say('🚧 build');
		}

		// 初始化creepconfig
		var target;
		var source;
		if (!Memory.creepConfigs[creep.name]) {
			var config=new Config();
			config.builderInit(creep);
		}
		var creepData = Memory.creepConfigs[creep.name].data as WorkerData;
		target = Game.getObjectById(creepData.targetId);
		source = Game.getObjectById(creepData.sourceId);


		if (creep.memory.building) {
			if (!target){
				target = creep.room.find(FIND_CONSTRUCTION_SITES)[0];
				if(!target)
					return;
				creepData.targetId=target.id;
			}

			if (target) {
				if (creep.build(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, { visualizePathStyle: { stroke: '#ffffff' } });
				}
			}
		}
		else {
			if(!source){
				source = creep.room.find(FIND_SOURCES)[0];
				creepData.sourceId=source.id;
			}
			if (creep.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE||creep.harvest(source)==ERR_NOT_IN_RANGE) {
				creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
			}
		}
	}
}