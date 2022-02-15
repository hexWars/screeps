import _ from "lodash";

export class roleHarvester {
    static run(creep: Creep) {
        let creepConfig = Memory.creepConfigs[creep.name];
        let workData = creepConfig.data as HarvesterData;
        var target = Game.getObjectById(workData.targetId) as StructureContainer;
        if(target){
            var source=Game.getObjectById(workData.sourceId) as Source;
            if (creep.store.getFreeCapacity() > 0) {
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }
            if(creep.store.getFreeCapacity()<=0){
                if(creep.transfer(target,RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                    creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                }
                return;
            }
        }


        if (creep.store.getFreeCapacity() > 0) {
            var sources = creep.room.find(FIND_SOURCES);
            //var ruins = creep.room.find(FIND_RUINS).filter(x=>x.store[RESOURCE_ENERGY]>0);
            //if(ruins.length>0){
            //    console.log(ruins.length);
            //    if (creep.withdraw(ruins[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            //        creep.moveTo(ruins[0], { visualizePathStyle: { stroke: '#ffaa00' } });
            //    }
            //}
            if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffaa00' } });
            }
        }
        else {
            //对目标进行排序，顺序为扩展（extension）-》spawn-》Tower
            var targets = _.sortBy(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }), x => x.structureType);
            if (targets.length > 0) {
                if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
                }
            }
        }
    }
}