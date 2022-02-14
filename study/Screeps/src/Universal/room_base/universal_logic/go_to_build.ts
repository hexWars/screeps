export const go_to_build = function(creep: Creep, type?: BuildableStructureConstant){
    if (type != undefined){
        let construction = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
            filter: (structure) => {
                return (structure.structureType == type)
            }
        })
        if (construction){
            if(creep.build(construction) == ERR_NOT_IN_RANGE) {
                creep.moveTo(construction, {visualizePathStyle: {stroke: '#008cff'}})
            }
            return
        }
    }
    let constructions = creep.room.find(FIND_MY_CONSTRUCTION_SITES);
    if(constructions.length > 0) {
        if(creep.build(constructions[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(constructions[0], {visualizePathStyle: {stroke: '#008cff'}});
        }
        return
    }
    creep.memory.role = 'hr'
}
