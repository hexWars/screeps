export const test_work = function(creep: Creep){
    // console.log('run out')
    let target = new RoomPosition(17, 40, 'W47S14')
    if((!creep.memory.path || creep.pos.x == 0 || creep.pos.x == 49 || creep.pos.y == 0 || creep.pos.y == 49) && !creep.pos.isNearTo(target)) {
        console.log('find')
        creep.memory.path = creep.pos.findPathTo(target);
    }
    let code = creep.moveByPath(creep.memory.path)
    if (code == ERR_NOT_FOUND){
        if (creep.pos.isNearTo(target)){
            creep.memory.path = null
        }
        else{
            creep.memory.path = creep.pos.findPathTo(target);
        }
    }
    if (creep.pos.isNearTo(target)){
        creep.memory.path = null
    }
    console.log(code)
}