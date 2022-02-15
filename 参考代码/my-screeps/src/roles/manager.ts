import _ from "lodash";
import { log } from "@/utils";

export class roleManager {
    static run(creep: Creep) {

		if (creep.memory.working && creep.store[RESOURCE_ENERGY] == 0) {
			creep.memory.working = false;
			creep.say('🔄 harvest');
		}
		if (!creep.memory.working && creep.store.getFreeCapacity() == 0) {
			creep.memory.working = true;
			creep.say('🚧 working');
		}
        //log("我开始工作了！",["Manager运行日志",creep.name],'green');
        let sourceConfigs = _.filter(Memory.sourceConfigs, (x) => x.room == creep.room.name);
        let container: StructureContainer;
        for (const key in sourceConfigs) {
            var temp = Game.getObjectById(sourceConfigs[key].containerId) as StructureContainer;
            if (!container)
                container = temp;
            else if (container.store.getUsedCapacity() < temp.store.getUsedCapacity()) {
                container = temp;
            }
        }

        var source = container;
        if(creep.memory.working){
            //对目标进行排序，顺序为扩展（extension）-》spawn-》Tower
            var targets = _.sortBy(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }), x => x.structureType);
            if (targets.length > 0&&creep.store.getUsedCapacity()>0) {
                var index:number=0;
                while (this.transfer(creep,targets,index)&&creep.store.getUsedCapacity()>0&&index<3) {
                    index++;
                }
            }
            else if(creep.store.getUsedCapacity()>0){
                targets=_.sortBy(creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                }), x => x.structureType);
                if (targets.length > 0) {
                    var index:number=0;
                    while (this.transfer(creep,targets,index)&&creep.store.getUsedCapacity()>0&&index<3) {
                        index++;
                    }
                }
            }
        }
        else if(source){
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' } });
                return;
            }
        }
    }
    static transfer(creep:Creep,targets:AnyStructure[],index:number):boolean{
        if(targets[index]){
            if(creep.transfer(targets[index],RESOURCE_ENERGY)==ERR_NOT_IN_RANGE){
                creep.moveTo(targets[index], { visualizePathStyle: { stroke: '#ffffff' } });
                return false;
            }
        }
        return true;
    }
}