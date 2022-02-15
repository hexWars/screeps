import {clear_spawn_queue, check_one_role} from '../universal_logic/check_spawn_queue'

export const level1_check_spawn_queue = function(roomName: string){
    clear_spawn_queue(roomName)
    check_one_role(Game.rooms[roomName], 'hu')
}
