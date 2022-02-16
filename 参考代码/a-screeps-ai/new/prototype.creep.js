var roleHarvester = require('role.harvester');
var roleHarvesterbingan = require('role.harvesterbingan');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
const roleGuarder = require('role.guarder');
var roleMover = require('role.mover');
var roleRepaier = require('role.repaier');
var roleMover1 = require('role.mover1');
var roleMover2 = require('role.mover2');
var roleOutclaimer = require('role.outclaimer');
var roleMoverout = require('role.moveout');
var roleMiner=require('role.miner');
var roleWorker=require('role.worker');
var dpharvest=require('role.dpharvest');
var powermove=require('role.power');
var movehomepower=require('role.movehomepower')

var runRole = {
    run: function(creep){
        //run role
        if(creep.memory.role == 'harvester') {
            runcreeprole(roleHarvester,creep)
        }
        if(creep.memory.role == 'mp') {
            runcreeprole(movehomepower,creep)
        }
        if(creep.memory.role == 'harvesterbingan') {
            runcreeprole(roleHarvesterbingan,creep)
        }
        if(creep.memory.role == 'worker') {
            runcreeprole(roleWorker,creep)
        }
        if(creep.memory.role == 'miner') {
            runcreeprole(roleMiner,creep)
        }
        if(creep.memory.role == 'guarder'){
            runcreeprole(roleGuarder,creep)
        }
        if(creep.memory.role == 'upgrader') {
            runcreeprole(roleUpgrader,creep)
        }
        if(creep.memory.role == 'builder') {
            runcreeprole(roleBuilder,creep)
        }
        if(creep.memory.role == 'mover'){
            runcreeprole(roleMover,creep)
        }
        if(creep.memory.role == 'mover1'){
            runcreeprole(roleMover1,creep)
        }
        if(creep.memory.role == 'mover2'){
            runcreeprole(roleMover2,creep)
        }
        if(creep.memory.role=='moverout'){
            runcreeprole(roleMoverout,creep)
        }
        if(creep.memory.role == 'repair'){
            runcreeprole(roleRepaier,creep)
        }
        if(creep.memory.role == 'outclaimer'){
            runcreeprole(roleOutclaimer,creep)
        }
        if(creep.memory.role == 'dh'){
            runcreeprole(dpharvest,creep)
        }
        if(creep.memory.role=='pt'){
            powermove.atrun(creep);
        }
        if(creep.memory.role=='hpt'){
            powermove.ahrun(creep);
        }
        if(creep.memory.role=='pm'){
            powermove.powerm(creep);
        }
    }
}
module.exports = runRole;
function runcreeprole(role,creep){
    try{
        role.run()
    }catch(err){
        console.log(err.stack)
    }
}
