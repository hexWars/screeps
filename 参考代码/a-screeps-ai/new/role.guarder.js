var roleGuarder ={
    /** @param {Creep} creep **/
    run: function(creep) {
        //进攻   
        if(creep.memory.taroom){
            if(creep.goToRoom(creep.memory.taroom))attactroom(creep)
        }else{attactroom(creep)}  
        function attactroom(creep){
            if(creep.getActiveBodyparts(RANGED_ATTACK)>0){
                const target1 = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS); 
                if(target1){var x1=creep.pos.x;  var y1=creep.pos.y; var x2=target1.pos.x; var y2=target1.pos.y;}    
                if(target1){
                    if(creep.pos.inRangeTo(target1, 3)) {
                        creep.rangedAttack(target1);
                    }else{
                        creep.moveTo(target1);
                    }
                    if(creep.pos.isNearTo(target1)) {
                        function random(min,max){
                            return Math.floor(Math.random()*(max-min))+min;
                        }
                        var x10=random(0,49);
                        var y10=random(0,49);
                        var flag1=(y1+y2)/2+(x1-x2)(x1+x2)/(2*y2-2*y1)-(x2-x1)/(y2-y1)*x10-y10;
                        var flag2=(y1+y2)/2+(x1-x2)(x1+x2)/(2*y2-2*y1)-(x2-x1)/(y2-y1)*x1-y1;
                        if((flag1>0)&&(flag2>0)||(flag1<0)&&(flag2<0)){
                            creep.moveTo(x10,y10);
                        }
                    }
                }  
                else if(!targets){
                    creep.moveTo(25,25);
                } 
            }
            if(creep.getActiveBodyparts(ATTACK)>0){
                    const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);  
                    if(target) {
                        if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                        }
                    }else{
                        const notmy= creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_INVADER_CORE)})
                        if(notmy){
                            if(creep.attack(notmy)==ERR_NOT_IN_RANGE){
                                creep.moveTo(notmy)
                            }
                        }
                    }
                
            }
        }                       
    }    
}
module.exports = roleGuarder;