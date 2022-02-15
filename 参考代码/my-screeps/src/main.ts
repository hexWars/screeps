import _ from 'lodash';
import { ErrorMapper } from './modules/errorMapper'
import { roleHarvester } from '@/roles/harvester'
import { roleUpgrader } from '@/roles/upgrader'
import { roleBuilder } from '@/roles/builder'
import { roleManager } from '@/roles/manager';
import { RoleType } from '@/utils'
import { CreepCount } from '@/setting'
import assignall from '@/roomobjects'
import memInit from '@/modules/memory'
import Config from '@/config'

export const loop = ErrorMapper.wrapLoop(() => {
    memInit();
    assignall();
    Config();
    if (Game.time % 20 == 0) {
        console.log('Version:0.21');
    }
    // 销毁死亡creep
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    for (var name in Memory.creepConfigs) {
        if (!Game.creeps[name]) {
            delete Memory.creepConfigs[name];
            console.log('Clearing non-existing creepConfig memory:', name);
        }
    }


    spawnCreep();

    // tower修复逻辑
    var tower = Game.rooms["W22N26"].find(FIND_MY_STRUCTURES, { filter: x => x.structureType == STRUCTURE_TOWER })[0] as StructureTower;
    if (tower)
        tower.work();


    // tower逻辑
    /*var tower = Game.rooms["W28N28"].find(FIND_MY_STRUCTURES).find(x=>x.structureType==STRUCTURE_TOWER) as StructureTower;
    if(tower) {
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if(closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
    }*/

    // creep角色逻辑
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
        if (creep.memory.role == 'manager') {
            roleManager.run(creep);
        }
    }
})

/**
 * 接受两个数字并相加
 */
export const testFn = function (num1: number, num2: number): number {
    return num1 + num2
}

/**
 * 检查creep数量并补充
 */
function spawnCreep() {
    var rcl = Game.spawns['Spawn1'].room.controller.level;
    var spawn = Game.spawns['Spawn1'];

    // 如果正在生成，则返回
    if (spawn.spawning) {
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            { align: 'left', opacity: 0.8 });
        return;
    }

    // 检查creep数量并补充
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var managers = _.filter(Game.creeps, (creep) => creep.memory.role == 'manager');
    if (harvesters.length < CreepCount[rcl][RoleType.Harvester]) {
        var newName = 'Harvester' + Game.time;
        console.log('Spawning new harvester: ' + newName);
        spawn.spawnCreep(spawn.getBodys(RoleType.Harvester), newName,
            { memory: { role: 'harvester' } });
        return;
    }
    else if (managers.length < CreepCount[rcl][RoleType.Manager]) {
        var newName = 'Manager' + Game.time;
        console.log('Spawning new manager: ' + newName);
        spawn.spawnCreep(spawn.getBodys(RoleType.Manager), newName,
            { memory: { role: 'manager' } });
        return;
    }
    else if (builders.length < CreepCount[rcl][RoleType.Builder]) {
        var newName = 'Builder' + Game.time;
        console.log('Spawning new builder: ' + newName);
        spawn.spawnCreep(spawn.getBodys(RoleType.Worker), newName,
            { memory: { role: 'builder' } });
        return;
    }
    else if (upgraders.length < CreepCount[rcl][RoleType.Upgrader]) {
        var newName = 'Upgrader' + Game.time;
        console.log('Spawning new upgrader: ' + newName);
        spawn.spawnCreep(spawn.getBodys(RoleType.Upgrader), newName,
            { memory: { role: 'upgrader' } });
        return;
    }

}