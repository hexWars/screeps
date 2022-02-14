import {clear_spawn_queue, check_one_role} from './../universal_logic/check_spawn_queue'

export const level2_check_spawn_queue = function(roomName: string){
    let room = Game.rooms[roomName]
    clear_spawn_queue(roomName)

    check_one_role(room, 'hf')
    check_one_role(room, 'hu')
    check_one_role(room, 'hb')
    check_one_role(room, 'hr')
}