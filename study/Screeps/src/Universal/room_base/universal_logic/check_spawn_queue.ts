import FlatQueue from './../universal_logic/FlatQueue'
import {room_config} from './../config'

export const clear_spawn_queue = function(roomName: string){
    Memory.rooms[roomName].spawnQueue = {}
    new FlatQueue(Game.rooms[roomName].memory.spawnQueue)
}

export const get_role_workers = function(role: string, roomName: string, min_ticksToLive?: number, role_1?: string, source_idx?: number){
    if (role == 'base_transfer' || role == 'tower_transfer'){
        role_1 = 'cleaner'
    }
    if (source_idx == undefined){
        if (role_1 == undefined || role_1 == ''){
            if (min_ticksToLive == undefined)
                return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.room.name == roomName);
            else
                return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.room.name == roomName && creep.ticksToLive >= min_ticksToLive);
        }
        else{
            if (min_ticksToLive == undefined)
                return _.filter(Game.creeps, (creep) => (creep.memory.role == role || creep.memory.role == role_1) && creep.room.name == roomName);
            else
            return _.filter(Game.creeps, (creep) => (creep.memory.role == role || creep.memory.role == role_1) && creep.room.name == roomName && creep.ticksToLive >= min_ticksToLive);
        }
    }
    else{
        if (role_1 == undefined){
            if (min_ticksToLive == undefined)
                return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.room.name == roomName && creep.memory.source_idx == source_idx);
            else
                return _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.room.name == roomName && creep.memory.source_idx == source_idx && creep.ticksToLive >= min_ticksToLive);
        }
        else{
            if (min_ticksToLive == undefined)
                return _.filter(Game.creeps, (creep) => (creep.memory.role == role || creep.memory.role == role_1) && creep.room.name == roomName && creep.memory.source_idx == source_idx);
            else
            return _.filter(Game.creeps, (creep) => (creep.memory.role == role || creep.memory.role == role_1) && creep.room.name == roomName && creep.memory.source_idx == source_idx && creep.ticksToLive >= min_ticksToLive);
        }
    }
}

export const check_one_role = function(room: Room, role: string, priority?: number, roleNum?: number, bodyParts?: BodyPartConstant[], source_idx?: number){
    if (priority == undefined){
        priority = room_config['priority'][role] == undefined ? room_config['priority']['hb'] + 1: room_config['priority'][role]
    }
    if (room_config[room.name] == undefined){
        console.log(room.name, ' config not set')
        return
    }
    let config_level: string = 'level' + room.controller.level
    if (room_config[room.name][config_level] == undefined){
        console.log(room.name, config_level, ' config not set, use default')
        config_level = 'default'
        if (room_config[room.name][config_level] == undefined){
            console.log(room.name, 'default config', ' not set')
            return
        }
    }
    if (room_config[room.name][config_level][role] == undefined){
        console.log(room.name, config_level, role, ' config not set')
        return
    }
    if (role == 'hb' || role == 'builder'){
        if (room.find(FIND_MY_CONSTRUCTION_SITES).length == 0){
            return
        }
    }
    if (role == 'upgrader_link'){
        if (room.controller.level == 8){
            roleNum = 1
        }
        if (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 50000 || room.controller.ticksToDowngrade > 150000){
            roleNum = 0
            return
        }
    }
    if (role == 'repairer'){
        if (room.controller.level == 8){
            roleNum = 1
        }
        if (room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 50000){
            roleNum = 0
            return
        }
    }
    let role_workers_length: number
    if (role == 'hf'){
        if (role_workers_length == 0){
            Memory.rooms[room.name].restart_flag = true
        }
        else{
            delete Memory.rooms[room.name].restart_flag
        }
    }
    roleNum = roleNum == undefined? room_config[room.name][config_level][role]['num'] : roleNum
    if (source_idx == undefined && room_config[room.name][config_level][role]['source_idx'] == undefined){
        role_workers_length = get_role_workers(role, room.name, room_config[room.name][config_level][role]['ticksToLive']).length
        for (let i = roleNum - role_workers_length; i > 0; i--){
            let data: spawnData = {
                name: (i == 1 ? role : role + i),
                bodyParts: bodyParts == undefined? room_config[room.name][config_level][role]['bodyParts']: bodyParts,
                memory: {
                    role: role,
                }
            }
            room.addSpawnTask(priority, data)
        }
    }
    else{
        source_idx = source_idx == undefined? room_config[room.name][config_level][role]['source_idx']: source_idx
        role_workers_length = get_role_workers(role, room.name, room_config[room.name][config_level][role]['ticksToLive'], '', source_idx=source_idx).length
        for (let i = roleNum - role_workers_length; i > 0; i--){
            let data: spawnData = {
                name: (i == 1 ? role : role + i),
                bodyParts: bodyParts == undefined? room_config[room.name][config_level][role]['bodyParts']: bodyParts,
                memory: {
                    role: role,
                    source_idx: source_idx,
                }
            }
            room.addSpawnTask(priority, data)
        }
    }
}