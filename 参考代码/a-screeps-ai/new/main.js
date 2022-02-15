var runRole= require('prototype.creep');
var runspawn= require('prototype.spawn');
var labCtrol= require('prototype.lab');
var factoryCtrol=require('prototype.factory')
var terminalCtrol = require('prototype.terminal');
var rpower = require('role.powercreep');
var ober = require('module.ober');
var Addmemory=require('memory');
var war=require('module.warsquad');
var outminer=require('module.outminer')
require('module.mover');
require('memory2.0');

module.exports.loop = function () {
    //更新缓存
    if(Game.time%10==0){
        for (let rooms in Game.rooms) {
            Addmemory.run(rooms);
        }
    }
    //清理内存
    for(var name in Memory.resourse) {
        if(!Game.rooms[name]){delete Memory.resourse[name]}
    }
    for(var name in Memory.linker) {
        if(!Game.rooms[name]){delete Memory.linker[name]}
    }
    for(var name in Memory.mover) {
        if(!Game.rooms[name]){delete Memory.mover[name]}
    }
    for(var name in Memory.minerals) {
        if(!Game.rooms[name]){delete Memory.minerals[name]}
    }
    for(var name in Memory.lab) {
        if(!Game.rooms[name]){delete Memory.lab[name]}
    }
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            console.log('Clearing non-existing creep memory:', Memory.creeps[name].role);
            delete Memory.creeps[name];
        }
    }
    //creep工作,powercreep工作
    for (let name in Game.creeps) {

        var creep = Game.creeps[name];
        runRole.run(creep);

    }

    for(let name in Game.powerCreeps){
        var powers = Game.powerCreeps[name];
        if(!(powers.spawnCooldownTime > Date.now())) {
            powers.spawn(Game.getObjectById('610260b6a186b67f26b403f2'));
        }
        rpower.run(powers);
    }

    //link工作,实验室工作,terminal工作,powerspawn工作，spawn工作,war状态改变
    for (let rooms in Game.rooms) {
        if(!Memory.war){Memory.war={}}
        if(Memory.lab[rooms]&&Memory.lab[rooms].ctrol){labCtrol.product(rooms);}
        if(Game.time%10==0)terminalCtrol.run(rooms);
        if(Game.time%3==0)runspawn.run(rooms);
        var room=Game.rooms[rooms];
        if(room.powerSpawn){room.powerSpawn.processPower();}
        if(room.observer)ober.run(rooms);
        if(Game.time%500==0)room.update()
        if(Game.time%3==0&&room.spawn.length>0){
            var Hostiler=room.find(FIND_HOSTILE_CREEPS);
            if(Hostiler.length>0){Memory.war[rooms]=1}
            else{Memory.war[rooms]=0}
        }
        if(Memory.linker[room.name]){const linkTo = Game.getObjectById(Memory.linker[room.name].linkTo);
        const linkTo1 = Game.getObjectById(Memory.linker[room.name].linkTo1);
        for (var i in Memory.linker[room.name].linkFrom) {
            let linkFrom = Game.getObjectById(Memory.linker[room.name].linkFrom[i]);
            if(linkFrom&&linkTo1&&linkTo1.store[RESOURCE_ENERGY]<500){
                linkFrom.transferEnergy(linkTo1);
            }else if(linkFrom&&linkTo){
                linkFrom.transferEnergy(linkTo);
            }
        } }
    }

    //优化tower12
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    for (let tower of towers) {
        if(Memory.war[tower.room.name]==1){
            var Hostiler=tower.pos.findInRange(FIND_HOSTILE_CREEPS,10);
            var closestestHostile=tower.pos.findInRange(FIND_HOSTILE_CREEPS,5)
            if(closestestHostile.length>0){
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                tower.attack(closestHostile);
            }else{
                Hostiler=Hostiler[Math.floor(Math.random()*Hostiler.length)];
                if(Hostiler){
                    tower.attack(Hostiler);
                }
            }
        }
        if(Game.time%2==0&&Memory.war[tower.room.name]==0){
            var closestDamagedStructure = tower.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_ROAD )
                    && structure.hits / structure.hitsMax <= 0.6;
                }
            });
            var closestDamagedcreep = tower.room.find(FIND_MY_CREEPS, {
                filter: function(object) {return object.hits < object.hitsMax;}
            });
            closestDamagedStructure.sort((a,b) => a.hits - b.hits);
            if(closestDamagedStructure.length>0) {
                tower.repair(closestDamagedStructure[0]);
            }
            closestDamagedcreep.sort((a,b) => a.hits - b.hits);
            if(closestDamagedStructure.length==0 &&closestDamagedcreep.length>0){
                tower.heal(closestDamagedcreep[0]);
            }
            var storage=tower.room.storage;
            if((storage&&storage.store[RESOURCE_ENERGY]>100000)||tower.room.controller.level<=4){
                var closestDamagedcampart = tower.room.find(FIND_STRUCTURES,  {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_RAMPART)
                        && structure.hits / structure.hitsMax <= 0.005;
                    }
                });
                closestDamagedcampart.sort((a,b) => a.hits - b.hits);
                if(closestDamagedStructure.length==0 &&closestDamagedcreep.length==0&&closestDamagedcampart.length>0) {
                    tower.repair(closestDamagedcampart[0]);
                }
            }
        }
    }

    //战争
    //if(Game.flags['war']){warflag.war();}
    //巡逻
    //war.run('squadName','melee4','E9N2');

    factoryCtrol.run()


    try{
        outminer.run('W31N9','W32N9')
        outminer.run('W28N6','W27N6')
        outminer.run('W28N6','W28N5')
    }catch(err){
        console.log(err.stack)
    }

}

