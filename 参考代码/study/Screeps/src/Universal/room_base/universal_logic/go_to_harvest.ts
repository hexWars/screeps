global.harvest_err_code = new Map([
    [0, 'OK'],
    [-1, 'ERR_NOT_OWNER'],
    [-4, 'ERR_BUSY'],
    [-5, 'ERR_NOT_FOUND'],
    [-6, 'ERR_NOT_ENOUGH_RESOURCES'],
    [-7, 'ERR_INVALID_TARGET'],
    [-9, 'ERR_NOT_IN_RANGE'],
    [-11, 'ERR_TIRED'],
    [-12, 'ERR_NO_BODYPART']
])

export const go_to_harvest = function(creep: Creep, source: Source, pos?: RoomPosition){
    if (creep.pos.isNearTo(source)){
        if (!creep.memory.dontPullMe){
            creep.memory.dontPullMe = true
        }
        let code: CreepActionReturnCode | ERR_NOT_FOUND | ERR_NOT_ENOUGH_RESOURCES = creep.harvest(source)
        if (code != OK){
            if (code == ERR_NO_BODYPART){
                console.log(Game.time, global.harvest_err_code.get(code))
                creep.suicide()
                return
            }
            else if (code == ERR_NOT_ENOUGH_ENERGY){
                // console.log(Game.time, global.harvest_err_code.get(code))
                return code
            }
            else if (code != ERR_BUSY && code != ERR_NOT_OWNER){
                // ERR_BUSY: spawning
                // ERR_NOT_ENOUGH_ENERGY
                // ERR_NOT_OWNER: controller is reserved by other player of Invader
                console.log(Game.time, global.harvest_err_code.get(code))
                return code
            }
        }
    }
    else{
        if (!pos){
            creep.moveTo(source)
        }
        else{
            creep.moveTo(pos)
        }
    }
}
