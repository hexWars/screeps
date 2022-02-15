/*
对spawnCreep的任务列表的一个实现

需搭配分布式数量控制（见Hoho教程）使用

author: Sokranotes
inspired by: HoPGoldy(Hoho)
FlatQueue.js来自
https://github.com/TheZoc/screeps/blob/4bd8ebbe0215f755aa18a5461fc811cc13c0f50a/datastructure.priorityqueue.js
date: 2021/11/2


Usage:
// 使用建议:
// 需要有一点的编程基础
// 同时使用集中式数量控制与分布式数量控制
// 初始化时采用集中式数量控制统一更新spawnQueue，而后只进行死亡检查，间隔一段时间之后采用集中式数量控制刷新spawnQueue

// spawn自动从spawnQueue中取任务执行
import { doing } from "./spawn"
doing(Game.spawns)

// 向任务列表中添加任务
let priority: number = 10
let data: spawnData = {
    name: (i == 1 ? '' : '_' + i),
    memory: {
        role: 'hu',
        source_idx: hu_source_idx,
    }
}
Game.rooms[roomName].addSpawnTask(priority, data)

// 清空列表（可不定时检查，或战争等状态时需要）
import FlatQueue from './FlatQueue'
Memory.rooms[roomName].spawnQueue = {}
new FlatQueue(Game.rooms[roomName].memory.spawnQueue)

// 分布式死亡检查设计样例1
export const harvest_upgrade_work = function(creep: Creep){
    // 死亡检查
    let priority: number = 10
    let minTicksToLive = 150
    if (creep.ticksToLive <= minTicksToLive){
        const data = {
            role: creep.memory.role, 
            memory: {
                role: creep.memory.role,
                source_idx: creep.memory.source_idx
            }
        }
        creep.room.addSpawnTask(priority, data)
    }
    
    // 状态转换及工作
    if(creep.memory.is_working && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.is_working = false
    }
    if(!creep.memory.is_working && creep.store.getFreeCapacity() == 0) {
        creep.memory.is_working = true
    }
    if(creep.memory.is_working) {
        // todo
    }
    else {
        // todo
    }
}

// 分布式死亡检查设计样例2
// 如果不删除原有memory，同名creep可直接继承memory，但需要注意初始化（参考hoho教程）
for(let name in Memory.creeps) {
        let creep = Game.creeps[name]
        if(!creep) {
            // 配置工作
            room.addSpawnTask(priority, data)
            delete Memory.creeps[name];
        }
        else{
            // todo
        }
    }
*/

import FlatQueue from './FlatQueue'

// creep 生成主要实现
Spawn.prototype.mainSpawn = function(data: spawnData) {
    // 设置body或Memory中需附带的信息，Hoho这部分通过加载配置文件中的配置实现，也可以直接硬编码在这里
    let bodys: BodyPartConstant[] = [WORK, CARRY, MOVE, MOVE]
    data.name = '' + data.memory.role + Game.time + data.name
    const code = this.spawnCreep(bodys, data.name, {memory: data.memory});
    return code
}

// 检查任务队列
Spawn.prototype.work = function() {
    // spawn safe mode
    if (this.notifyWhenAttacked(true) == OK && this.hits < 0.6*this.hitsMax){
        this.room.controller.activateSafeMode()
    }
    if (Memory.rooms[this.room.name].spawnQueue == undefined){
        Memory.rooms[this.room.name].spawnQueue = {}
    }
    let spawnQueue: FlatQueue = new FlatQueue(Memory.rooms[this.room.name].spawnQueue);
    // 自己已经在生成了 / 生产队列为空 就啥都不干
    if (this.spawning || Memory.rooms[this.room.name].spawnQueue.length == 0) return 
    // 进行生成
    let code: ScreepsReturnCode = this.mainSpawn(spawnQueue.peek())
    // 生成成功后移除任务
    if (code == OK) spawnQueue.pop()
}

// 所有spawns执行工作
// doing(Game.spawns)

/**
 * author: hoho
 * 执行 Hash Map 中子元素对象的 work 方法
 * 
 * @param hashMap 游戏对象的 hash map。如 Game.creeps、Game.spawns 等
 */
//  export function doing(...hashMaps: object[]): void {
//     hashMaps.forEach((obj, index) => {
//         let startCost = Game.cpu.getUsed()

//         // 遍历执行 work
//         Object.values(obj).forEach(item => {
//             if (item.work) item.work()
//         })

//         // 如果有需求的话就显示 cpu 消耗
//         if (Game.flags.showCost) console.log(`消耗 ${Game.cpu.getUsed() - startCost}`, [ `[${index}]` ])
//     })
// }

// const data = {
//     bodyParts: staticHarvesterParts,
//     name: newStaticHarvesterName, // Maybe move this to the actual spawning function?
//     memory: {
//         role: constants.ROLE_STATIC_HARVESTER,
//         source: i,
//         room: room.name
//     }
// }

// const code = targetSpawn.spawnCreep(spawnData.bodyParts,
//     spawnData.name,
//     {memory: spawnData.memory});

// 将生成任务推入队列
// Room.prototype.addSpawnTask = function(priority: number, data: spawnData) {
//     if (Memory.rooms[this.name].spawnQueue == undefined){
//         Memory.rooms[this.name].spawnQueue = {}
//     }
//     // 任务加入队列
//     let spawnQueue: FlatQueue = new FlatQueue(Memory.rooms[this.name].spawnQueue);
//     spawnQueue.push(priority, data)
//     return spawnQueue.length
// }