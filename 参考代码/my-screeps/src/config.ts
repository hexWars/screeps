import _, { filter } from "lodash";
import { log, RoleType } from "./utils";

export default () => {
    var config = new Config();
    config.initSource();
    config.initCreep();
}

export class Config {
    initCreep() {
        for (const name in Game.creeps) {
            if (Memory.creepConfigs[name])
                continue;
            const creep = Game.creeps[name];
            switch (creep.memory.role) {
                case RoleType.Harvester:
                    this.harvesterInit(creep);
                    break;
                case RoleType.Builder:
                    this.builderInit(creep);
                case RoleType.Upgrader:
                    this.upgraderInit(creep);
                case RoleType.Manager:
                    this.managerInit(creep);
                default:
                    break;
            }
        }
    }
    // harvester逻辑
    harvesterInit(creep: Creep) {
        var sourceCount: {
            [sourceId: string]: number
        }={};
        for (const key in Memory.creepConfigs) {
            var item = Memory.creepConfigs[key];
            if (item.role == 'harvester' && item.spawnRoom == creep.room.name) {
                var data = item.data as HarvesterData;
                if (!sourceCount[data.sourceId])
                    sourceCount[data.sourceId] = 1;
                else
                    sourceCount[data.sourceId]++;
            }
        }

        let sourceId: string;
        let targetId: string;
        // 确认资源点
        const sourceConfigs = Memory.sourceConfigs;

        for (const key in sourceCount) {
            log(sourceCount[key].toString(), ["source(" + key + ")对应creep占用数量"], "green");
            log(sourceConfigs[key].seat.toString(), ["source(" + key + ")限制占用数量上限"], "green");
            if (sourceCount[key] >= sourceConfigs[key].seat) {
                continue;
            }
            sourceId = key;
            break;
        }

        if (!sourceId)
            sourceId = creep.room.find(FIND_SOURCES)[0].id;

        var sourceConfig = sourceConfigs[sourceId];
        log(sourceConfig.containerId, ["source(" + sourceId + ")对应containerID",'待确认'], "green");
        if (sourceConfig.containerId) {
            targetId = sourceConfig.containerId;
            log(targetId, ["source(" + sourceId + ")对应containerID"], "green");
        }
        else if (!targetId) {
            var targets = _.sortBy(creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            }), x => x.structureType);
            targetId = targets[0].id;
        }

        Memory.creepConfigs[creep.name] = {
            role: 'harvester',
            data: { sourceId: sourceId, targetId: targetId },
            spawnRoom: creep.room.name,
            bodys: 'harvester'
        };
    }
    // builder逻辑
    builderInit(creep: Creep) {
        var sources = _.sortBy(creep.room.find(FIND_STRUCTURES, {
            filter: x => x.structureType == STRUCTURE_CONTAINER
        }), x => -(x as StructureContainer).store.getUsedCapacity());

        log(creep.name, ["创建Builder"], "green");

        Memory.creepConfigs[creep.name] = {
            role: 'worker',
            data: { sourceId: sources[0].id, targetId: creep.room.find(FIND_CONSTRUCTION_SITES)[0].id },
            spawnRoom: creep.room.name,
            bodys: 'worker'
        };
    }
    // upgrader逻辑
    upgraderInit(creep: Creep) {
        Memory.creepConfigs[creep.name] = {
            role: 'upgrader',
            data: { sourceId: creep.room.find(FIND_SOURCES)[0].id, targetId: creep.room.controller.id },
            spawnRoom: creep.room.name,
            bodys: 'upgrader'
        };
    }
    managerInit(creep: Creep) {
        log(creep.name, ["创建Manager"], "green");
        // 作为物流运输人员，需要确认source
        Memory.creepConfigs[creep.name] = {
            role: 'worker',
            data: { sourceId: creep.room.find(FIND_SOURCES)[0].id, targetId: "" },
            spawnRoom: creep.room.name,
            bodys: 'worker'
        };
    }
    initSource() {
        var sources: Source[] = [];
        _.each(Game.rooms, x => sources = sources.concat(x.find(FIND_SOURCES)));
        for (const name in sources) {
            if (!Memory.sourceConfigs[sources[name].id]) {
                var source = sources[name];
                //var containers = source.pos.findInRange(FIND_MY_STRUCTURES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })
                //var containerId:string="";
                //if(containers){
                //    var consites= source.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 1, { filter: { structureType: STRUCTURE_CONTAINER } })
                //    if(consites)
                //        containerId=consites[0].id;
                //}
                //containerId=containers[0].id;
                //if(containerId=="")
                //    source.room.createConstructionSite(1,2,STRUCTURE_CONTAINER);

                Memory.sourceConfigs[source.id] = {
                    containerId: "",
                    room: source.room.name,
                    seat: 1
                };
            }
        }
    }
    //initConStruction(){
    //    let constructionList=Memory.constructionList;
    //    for (const name in Game.rooms) {
    //        let room=Game.rooms[name];
    //        if(!constructionList[name])
    //            constructionList[name]=[];
    //        for (const str in room.find(FIND_CONSTRUCTION_SITES)) {
    //            if (Object.prototype.hasOwnProperty.call(game, str)) {
    //                const element = game[str];
    //                
    //            }
    //        }
    //
    //        if (Object.prototype.hasOwnProperty.call(object, key)) {
    //            const element = object[key];
    //            
    //        }
    //    }
    //}
}