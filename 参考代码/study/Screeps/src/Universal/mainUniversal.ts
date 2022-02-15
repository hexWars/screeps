import { room_logic } from './room_logic';

export const mainUniversal = function(rooms: string[]){
    for (let idx in rooms){
        room_logic(rooms[idx])
    }
}