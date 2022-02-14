import { level1_logic } from "./room_base/level1/level1_logic"
import { level2_logic } from "./room_base/level2/level2_logic"
import { level3_logic } from "./room_base/level3/level3_logic"
import { level4_logic } from "./room_base/level4/level4_logic"
import { room_init } from "./room_init"
import { doing } from "./room_base/universal_logic/spawn";

export const room_logic = function(roomName: string){
    if (Game.rooms[roomName]){
        if (Game.rooms[roomName].controller){
            if (Game.rooms[roomName].controller.my){
                room_init(roomName)
                switch(Game.rooms[roomName].controller.level){
                    case 1:
                        level1_logic(roomName)
                        break
                    case 2:
                        level2_logic(roomName)
                        break
                    case 3:
                        level3_logic(roomName)
                        break
                    case 4:
                        level4_logic(roomName)
                        break
                    default:
                        level4_logic(roomName)
                }
                doing(Game.spawns)
            }
            else{
                console.log(Game.time, 'room_logic', roomName, 'controller is not my')
            }
        }
        else{
            console.log(Game.time, 'room_logic', roomName, 'without controller')
        }
    }
    else{
        console.log(Game.time, 'room_logic', roomName, 'undefined')
    }
}