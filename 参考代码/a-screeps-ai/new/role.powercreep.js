var rpowers = {
    run: function(powers) {
        if(powers.room){
            var pcontroller=powers.room.controller;
            var terminal = powers.room.terminal;
            let powercreep = Game.getObjectById(Memory.mover[powers.room.name].powerspawn);
            if(!pcontroller.isPowerEnabled&&pcontroller.my){
                if(powers.enableRoom(pcontroller)==ERR_NOT_IN_RANGE){
                    powers.moveTo(pcontroller);
                }
            }
            powers.usePower(PWR_GENERATE_OPS);
            labs = new Array();
            Memory.lab[powers.room.name]['labs'].forEach(labid => {
                labs.push(Game.getObjectById(labid))
            });
            for(var i = 2;i<labs.length;i++){
                if(labs[i]&&labs[i].effects==undefined&&Memory.lab[powers.room.name].materials!=null){
                    if(powers.usePower(PWR_OPERATE_LAB,labs[i])==ERR_NOT_IN_RANGE){
                        powers.moveTo(labs[i])
                    }
                }
            }



            if(powers.store[RESOURCE_OPS]>200){
                if(powers.transfer(terminal,RESOURCE_OPS,100)== ERR_NOT_IN_RANGE) {
                    powers.moveTo(terminal);
                }
            }
            if(powers.ticksToLive<=200){if(powers.renew(powercreep)==ERR_NOT_IN_RANGE){powers.moveTo(powercreep);}}
        }
	}
};
module.exports = rpowers;