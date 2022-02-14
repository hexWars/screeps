import { check_one_role } from "@/Universal/room_base/universal_logic/check_spawn_queue"

const judge_source_depend_structure = function(roomName: string, source_idx: number){
    let source: Source = Game.getObjectById(Game.rooms[roomName].memory.sources_id[source_idx])
    if (source == undefined){
        console.log(Game.time, roomName, 'source ', source_idx, 'undefined')
    }
    let pos: RoomPosition = source.pos
    let terrain = new Room.Terrain(roomName)
    let end_flag = false
    for (let x = pos.x-2; x <= pos.x+2; x++){
        for (let y = pos.y-2; y <= pos.y+2; y++){
            if (x == y) continue
            if (terrain.get(x, y) != TERRAIN_MASK_WALL){
                for (let s of source.room.lookForAt(LOOK_STRUCTURES, x, y).values()){
                    if (s.structureType == STRUCTURE_LINK){
                        source.room.memory.source_link_ids[source_idx] = s.id as Id<StructureLink>
                        end_flag = true
                        break
                    }
                }
                if (end_flag) break
                if (source.pos.inRangeTo(x, y, 1)){
                    for (let s of source.room.lookForAt(LOOK_STRUCTURES, x, y).values()){
                        if (s.structureType == STRUCTURE_CONTAINER){
                            source.room.memory.source_container_ids[source_idx] = s.id as Id<StructureContainer>
                            end_flag = true
                            break
                        }
                    }
                    if (end_flag) break
                }
            }
        }
        if (end_flag) break
    }
    return end_flag
}

export function source_energy_mine(roomName: string){
    let room = Game.rooms[roomName]
    if (room == undefined){
        console.log(Game.time, roomName, 'undefined')
    }
    // if (room.memory.spawning) return
    let sources_num: number
    if (room.memory.sources_id == undefined){
        let sources: Source[] = room.find(FIND_SOURCES)
        sources_num = sources.length
        if (sources_num == 0){
            console.log(Game.time, roomName, 'have no source')
            return
        }
        room.memory.sources_id = new Array(sources_num)
        for (let i: number = 0; i < sources_num; i++){
            room.memory.sources_id[i] = sources[i].id
        }
    }
    else sources_num = room.memory.sources_id.length
    for (let i: number = 0; i < sources_num; i++){
        if (judge_source_depend_structure(roomName, i)){
            if (room.memory.source_link_ids[i] != undefined){
                check_one_role(room, 'hl', 2, 1, undefined, i)
            }
            else{
                check_one_role(room, 'hl', 2, 1, undefined, i)
            }
        }
    }
}