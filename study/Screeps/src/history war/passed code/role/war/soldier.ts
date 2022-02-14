export const soldier_work = function(creep: Creep, homeName: string, destName: string){
    // let exit = creep.pos.findClosestByPath(creep.room.find(FIND_EXIT_LEFT));
    // creep.moveTo(new RoomPosition(6, 31, roomName), {visualizePathStyle: {stroke: '#ffffff'}})
    // creep.moveTo(exit)
    // creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffff00'}});
    // var flag = 0
    // if (flag == 1){
    //     const targets = creep.room.find(FIND_HOSTILE_SPAWNS);
    //     if(targets.length) {
    //         if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE)
    //         {
    //             creep.moveTo(targets[0]);
    //         }
    //     }
    // }
    // else if (flag == 0){
    //     let backhome = creep.pos.findClosestByPath(creep.room.find(FIND_EXIT_RIGHT));
    //     creep.moveTo(backhome)
    // }
    // console.log(creep.name + ' yes, sir!')
    // console.log(creep.room.name)
    if (creep.room.name == roomName){
        creep.moveTo(new RoomPosition(25, 25, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        // console.log('yes, sir')
        // console.log(creep.memory.soldier_room_flag)
        // if (creep.memory.soldier_room_flag == undefined){
        //     // console.log('yes, undefined')
        //     creep.memory.soldier_room_flag = 1
        // }
        // if (creep.memory.soldier_room_flag == 1){
        //     // console.log('you still at home')
        //     creep.moveTo(new RoomPosition(0, 33, roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        // }
        // else{
        //     console.log('you are in the other place')
        // }

        // creep.moveTo(new RoomPosition(2, 30, roomName), {visualizePathStyle: {stroke: '#ff0000'}})

        // var targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS)
        // var invade_targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS, {
        //     filter: (s) => s.pos.x > 2 && s.pos.x < 48 && s.pos.y < 47 && s.pos.y > 2
        // });
        // if (invade_targets.length)
        // {
        //     if (creep.rangedAttack(invade_targets[0]) != OK)
        //     {
        //         // if (creep.rangedAttack(invade_targets[0])){
        //             creep.moveTo(invade_targets[0])
        //         // }
        //     }
        // }
            // else if (creep.attack(invade_targets[0]))
            // {
            //     creep.moveTo(invade_targets[0])
            // }
        //     // for (var i: number = 0; i < targets.length; i++)
        //     // {
        //     //     if ((targets[i].pos.x > 2 && targets[i].pos.x < 48) && ())
        //     //     if (creep.rangedAttack(targets[i]) == ERR_NO_BODYPART)
        //     //     {
        //     //         if (creep.attack(targets[0]))
        //     //         {
        //     //             creep.moveTo(targets[i])
        //     //         }
        //     //     }
        //     // }
        // }
        // else{
        //     if ((creep.pos.x > 5) || (creep.pos.y < 27 || creep.pos.y > 33)){
        //         creep.moveTo(new RoomPosition(2, 30, roomName), {visualizePathStyle: {stroke: '#ff0000'}})
        //     }
        // }
    }
    else{
        if (creep.pos.x > 47){
            creep.moveTo(new RoomPosition(25, 25, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        }

        // var targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS)
        // var invade_targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS, {
        //     filter: (s) => s.pos.x > 2 && s.pos.x < 48 && s.pos.y < 47 && s.pos.y > 2
        // });
        var invade_targets: Creep[] = creep.room.find(FIND_HOSTILE_CREEPS);
        if (invade_targets.length)
        {
            creep.room.memory.war_flag = true
            if (creep.rangedAttack(invade_targets[0]) != OK)
            {
                // if (creep.rangedAttack(invade_targets[0])){
                    creep.moveTo(invade_targets[0])
                // }
            }
            // if (invade_targets[0].pos)
        }
        else{
            creep.room.memory.war_flag = false
            creep.moveTo(new RoomPosition(25, 25, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        }

        // console.log('sir, not in this room.')
        // creep.moveTo(new RoomPosition(33, 23, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        // var targets = creep.room.find(FIND_HOSTILE_SPAWNS)
        // console.log('others spawn number' + targets.length)
        // console.log(targets[0].pos)
        // if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
        //     console.log('on my way')
        //     creep.moveTo(targets[0])
        // }
        // var targets = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return (structure.structureType == STRUCTURE_TOWER)
        //     }
        // })
        // console.log('others tower number' + targets.length)
        // console.log(targets[0].pos)
        // console.log('on my way')
        // creep.moveTo(new RoomPosition(18, 24, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        // if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
        //     console.log('attacking')
        //     creep.moveTo(targets[0])
        // }


        // creep.moveTo(new RoomPosition(15, 13, 'W48S14'), {visualizePathStyle: {stroke: '#ff0000'}})
        // var targets = creep.room.find(FIND_STRUCTURES, {
        //     filter: (structure) => {
        //         return (structure.structureType == STRUCTURE_CONTROLLER)
        //     }
        // })
        // // console.log('others controller number' + targets.length)
        // if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE){
        //     // console.log('attacking')
        //     creep.moveTo(targets[0])
        // }
    }
}