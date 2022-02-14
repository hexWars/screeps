import FlatQueue from './FlatQueue'

// creep 生成主要实现
Spawn.prototype.mainSpawn = function(data: spawnData): ScreepsReturnCode{
    let bodys: BodyPartConstant[]
    if (data.bodyParts == undefined){
        bodys = [WORK, CARRY, MOVE, MOVE]
        if (data.memory.role == 'hf' || data.memory.role == 'hu' || data.memory.role == 'hr' || data.memory.role == 'hb'){
            let road_flag = true
            if (!Memory.rooms[this.room.name].restart_flag){
                if (road_flag){
                    switch (this.room.energyCapacityAvailable){
                        case 300:
                        case 350:
                            bodys = [WORK, CARRY, MOVE]
                            break
                        case 400:
                        case 450:
                        case 500:
                        case 550:
                            bodys = [WORK, WORK, CARRY, CARRY, MOVE, MOVE]
                            break
                        case 600:
                        case 650:
                        case 700:
                        case 750:
                            bodys = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]
                            break
                        case 800:
                        case 850:
                        case 900:
                        case 950:
                            bodys = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]
                            break
                        case 1000:
                            bodys = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
                            break
                        default:
                            bodys = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
                    }
                }
                else{
                    switch (this.room.energyCapacityAvailable){
                        case 300:
                        case 350:
                            bodys = [WORK, CARRY, MOVE, MOVE]
                            break
                        case 400:
                        case 450:
                            bodys = [WORK, WORK, CARRY, MOVE, MOVE, MOVE]
                            break
                        case 500:
                        case 550:
                        case 600:
                            bodys = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE]
                            break
                        case 650:
                        case 700:
                        case 750:
                        case 800:
                            bodys = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
                            break
                        default:
                            bodys = [WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
                    }
                }
            }
        }
    }
    else{
        bodys = data.bodyParts
    }
    let raw_name = data.name
    data.name = '' + data.name + Game.time
    const code = this.spawnCreep(bodys, data.name, {memory: data.memory});
    if (code != OK){
        data.name = raw_name
    }
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
    if (Memory.rooms[this.room.name].spawnQueue.length == 0 && Memory.rooms[this.room.name].spawnQueue.data.length != 0) {
        Memory.rooms[this.room.name].spawnQueue = {}
        new FlatQueue(Memory.rooms[this.room.name].spawnQueue);
        return
    }
    if (this.spawning) {
        this.room.memory.spawning = true
        return
    }
    // 进行生成
    let data = spawnQueue.pop()
    if  (data == undefined) return
    let code: ScreepsReturnCode = this.mainSpawn(data)
    // 生成成功后移除任务
    if (code != OK) spawnQueue.push(data)
}

// 所有spawns执行工作
// doing(Game.spawns)

/**
 * author: hoho
 * 执行 Hash Map 中子元素对象的 work 方法
 * 
 * @param hashMap 游戏对象的 hash map。如 Game.creeps、Game.spawns 等
 */
export function doing(...hashMaps: object[]): void {
    hashMaps.forEach((obj, index) => {
        let startCost = Game.cpu.getUsed()

        // 遍历执行 work
        Object.values(obj).forEach(item => {
            if (item.work) item.work()
        })

        // 如果有需求的话就显示 cpu 消耗
        if (Game.flags.showCost) console.log(`消耗 ${Game.cpu.getUsed() - startCost}`, [ `[${index}]` ])
    })
}

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
Room.prototype.addSpawnTask = function(priority: number, data: spawnData) {
    if (Memory.rooms[this.name].spawnQueue == undefined){
        Memory.rooms[this.name].spawnQueue = {}
    }
    // 任务加入队列
    let spawnQueue: FlatQueue = new FlatQueue(Memory.rooms[this.name].spawnQueue);
    spawnQueue.push(priority, data)
    return spawnQueue.length
}