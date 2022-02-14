import { level2_check_spawn_queue } from "./level2_check_spawn_queue";
import { harvest_upgrade_work } from "../level1/harvest_upgrade_worker";
import { harvest_build_work } from "./harvest_build_worker";
import { harvest_fill_work } from "./harvest_fill_worker";
import { harvest_repair_work } from "./harvest_repair_worker";

export const level2_logic = function(roomName: string){
    for(let name in Memory.creeps) {
        let creep = Game.creeps[name]
        if(!creep) {
            delete Memory.creeps[name];
        }
        else{
            if(creep.memory.role == 'hu') {
                harvest_upgrade_work(creep);
            }
            else if (creep.memory.role == 'hb'){
                harvest_build_work(creep)
            }
            else if (creep.memory.role == 'hf'){
                harvest_fill_work(creep)
            }
            else if (creep.memory.role == 'hr'){
                harvest_repair_work(creep)
            }
        }
    }
    
    let room = Game.rooms[roomName]
    if (room.memory.check_spawn_queue_flag || Game.time%100 == 0 ||
        (Game.flags.check_spawn_queue_flag && Game.flags.check_spawn_queue_flag.room.name == roomName)){
        level2_check_spawn_queue(roomName)
        if (room.memory.check_spawn_queue_flag){
            delete room.memory.check_spawn_queue_flag
        }
        if (Game.flags.check_spawn_queue_flag && Game.flags.check_spawn_queue_flag.room.name == roomName){
            Game.flags.check_spawn_queue_flag.remove()
        }
    }
}