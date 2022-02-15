var roleMover ={
    /** @param {Creep} creep **/
    run: function(creep) {
        var fromenergy=getenergy(creep)
        var toenergy=needenergy(creep)
        //工作状态
        if(!creep.memory.moving)creep.memory.moving=0;
        if(creep.memory.moving==0&&creep.store[RESOURCE_ENERGY]>0)creep.memory.moving=1
        if(creep.memory.moving==1&&creep.store.getUsedCapacity()==0){
            if(fromenergy)creep.memory.moving=0
            else if(creep.room.terminal&&creep.room.storage){creep.memory.moving=2}
        }
        if(creep.memory.moving==2&&fromenergy&&creep.store.getUsedCapacity()==0){creep.memory.moving=0}
        //工作
        if(creep.memory.moving==0){
            if(creep.withdraw(fromenergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {creep.moveTo(fromenergy);}
        }
        if(creep.memory.moving==1){
            if(creep.transfer(toenergy, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {creep.moveTo(toenergy);}
        }
        if(creep.memory.moving==2){
            if(creep.store.getUsedCapacity()==0){
                for(const resourceType in creep.room.terminal.store) {
                    if(STREERESOURCE[resourceType]&&creep.room.storage.store[resourceType]<20000&&creep.withdraw(creep.room.terminal,resourceType) == ERR_NOT_IN_RANGE){
                        creep.moveTo(creep.room.terminal);                    
                    }
                } 
            }
            if(creep.transfer(creep.room.storage,Object.keys(creep.store)[0]) == ERR_NOT_IN_RANGE) {creep.moveTo(creep.room.storage);}
        }
    }
}
module.exports = roleMover;
const STREERESOURCE={XUH2O: 1,XUHO2: 1,XKH2O: 1,XKHO2: 1,XLH2O: 1,XLHO2: 1,XZH2O: 1,XZHO2: 1,XGH2O: 1,XGHO2: 1}
function getneedenergy(creep){
    var needenergy=Game.rooms[creep.room.name].extension
    for(let i of Game.rooms[creep.room.name].spawn){needenergy.push(i)}
    targets = creep.pos.findClosestByPath(needenergy, {
        filter: (structure) => {
            return structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0&&!_.some(Game.creeps, c => c.memory.targets==structure.id);
        }
    });
    if(targets){creep.memory.extension=targets.id}
    else{delete creep.memory.extension}
}
function getenergy(creep){
    var whereenergy=null;
    var container1;
    var storage=creep.room.storage;
    var tersour=creep.room.terminal
    var freecon=2000-creep.store.getCapacity()
    var powers = creep.room.powerSpawn;
    let container = Game.getObjectById(Memory.mover[creep.room.name].container);
    let tcontainer=Game.getObjectById(Memory.mover[creep.room.name].tcontainer)
    if(creep.memory.containerId)container1 = Game.getObjectById(creep.memory.containerId);
    if(container1&& container1.store[RESOURCE_ENERGY]>creep.store.getCapacity()){
        whereenergy=container1;
    }
    else{                   
        const link1 = Game.getObjectById(Memory.linker[creep.room.name].linkTo);
        if(link1&&link1.store[RESOURCE_ENERGY]>0) {
            whereenergy=link1;
        } 
        else if(storage&&((powers&&powers.store[RESOURCE_ENERGY]<3000)||(container&& container.store[RESOURCE_ENERGY]<freecon)||(tcontainer&& tcontainer.store[RESOURCE_ENERGY]<freecon)||(tersour&&tersour.store[RESOURCE_ENERGY]<20000)||creep.room.energyAvailable / creep.room.energyCapacityAvailable < 0.9 )){
            if(storage.store[RESOURCE_ENERGY]>0){
                whereenergy=storage
            }else if(creep.room.terminal&&creep.room.terminal.store[RESOURCE_ENERGY]>0){
                whereenergy=creep.room.terminal
            }
        }else if(creep.room.terminal&&creep.room.terminal.store[RESOURCE_ENERGY]>20800){
            whereenergy=creep.room.terminal
        }
    }
    return whereenergy;  
}
function needenergy(creep){
    var Toenergy=null;
    var freecon=2000-creep.store.getCapacity()
    var tersour=creep.room.terminal
    var powers = creep.room.powerSpawn;
    let container = Game.getObjectById(Memory.mover[creep.room.name].container);
    let tcontainer=Game.getObjectById(Memory.mover[creep.room.name].tcontainer)
    if(!creep.memory.extension){getneedenergy(creep)}
    if(creep.memory.extension){
        var tarextension=Game.getObjectById(creep.memory.extension)
        if(tarextension.store.getFreeCapacity(RESOURCE_ENERGY)==0){getneedenergy(creep);tarextension=Game.getObjectById(creep.memory.extension)}
        Toenergy=tarextension;
    }
    else{
        if(tcontainer&& tcontainer.store[RESOURCE_ENERGY]<freecon){Toenergy=tcontainer
        }else{
            if(container&& container.store[RESOURCE_ENERGY]<freecon){Toenergy=container}
            else{                         
                if(tersour&&tersour.store[RESOURCE_ENERGY]<20000){Toenergy=tersour} 
                else{
                    if(powers&&powers.store[RESOURCE_ENERGY]<3000){Toenergy=powers}
                    else if(creep.store.getUsedCapacity(RESOURCE_ENERGY)>0){Toenergy=creep.room.storage}                      
                }                     
            }
        }          
    }
    return Toenergy;
}
