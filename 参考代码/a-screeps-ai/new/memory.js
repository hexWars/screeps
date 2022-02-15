module.exports={
    run:function(roomName){
        let room=Game.rooms[roomName];
        if(!room)return false;
        if(!room.controller)return false;
        //find resourse
        if(!Memory.resourse){Memory.resourse = {}}
        if(!Memory.resourse[roomName]){Memory.resourse[roomName] = {}}
        let sources = room.source;
        Memory.resourse[roomName].length=sources.length;
        for(var i = 0;i<sources.length;i++){
            let linker = sources[i].pos.findInRange(room.link, 3)[0];
            let container = sources[i].pos.findInRange(room.container, 1)[0];
            if(!Memory.resourse[roomName][i]){Memory.resourse[roomName][i] = {}}
            Memory.resourse[roomName][i].id = sources[i].id;
            if(container){Memory.resourse[roomName][i].container=container.id;}
            if(linker){Memory.resourse[roomName][i].linker=linker.id;}
        } 
        //find mineral
        if(!Memory.minerals){Memory.minerals = {}}
        if(!Memory.minerals[roomName]){Memory.minerals[roomName] = {}}
        let minerals = room.mineral;
        let container = minerals.pos.findInRange(room.container, 1)[0];
        let extractor = room.extractor;
        Memory.minerals[roomName].id=minerals.id;
        if(container){Memory.minerals[roomName].container=container.id;}
        if(extractor){Memory.minerals[roomName].extractor=extractor.id;}
        //find linker
        let control=room.controller;
        let storage1 = room.storage;  
        if(!Memory.linker){Memory.linker = {}}
        if(!Memory.linker[roomName]){Memory.linker[roomName] = {}}
        if(!Memory.linker[roomName].linkFrom){Memory.linker[roomName].linkFrom = {}}
        if(storage1){
            const linkTo = storage1.pos.findInRange(room.link, 2)[0];
            const linkTo1 = control.pos.findInRange(room.link, 2)[0];
            for(var i=0;i<Memory.resourse[roomName].length;i++){
                var source= Game.getObjectById(Memory.resourse[roomName][i].id)
                let linkFrom = source.pos.findInRange(room.link, 2)[0];
                if(linkFrom){Memory.linker[roomName].linkFrom[i]=linkFrom.id;}
            }
            if(linkTo){Memory.linker[roomName].linkTo=linkTo.id;}
            if(linkTo1){Memory.linker[roomName].linkTo1=linkTo1.id;}
        }
        //moverMEMORY
        var towers = room.tower
        var rcontainer;var tcontainer;
        if(control){
            rcontainer= control.pos.findInRange(room.container, 1)[0];
        }
        if(towers[0]){
            tcontainer= towers[0].pos.findInRange(room.container, 1)[0];
        }
        if(!Memory.mover){Memory.mover = {}}
        if(!Memory.mover[roomName]){Memory.mover[roomName] = {}}
        if(rcontainer){Memory.mover[roomName].container=rcontainer.id;}
        if(tcontainer){Memory.mover[roomName].tcontainer=tcontainer.id;}
        //lab
        var labs = room.lab  
        if(!Memory.lab){ Memory.lab = {}}
        if(!Memory.lab[roomName]){Memory.lab[roomName] = {}}
        if(!Memory.lab[roomName].labs){Memory.lab[roomName].labs={}}
        labs.forEach(lab => {
            lab.value = 0;
            labs.forEach(l => {
                if(lab.pos.inRangeTo(l,2)){
                    lab.value ++;
                }
            });
        });
        labs.sort((a,b)=>(b.value - a.value));
        for(var i = 0;i<labs.length;i++){
            if(!Memory.lab[roomName].labs[i])Memory.lab[roomName].labs[i]={}
            Memory.lab[roomName].labs[i].id = labs[i].id;
            if(!Memory.lab[roomName].labs[i].boost)Memory.lab[roomName].labs[i].boost=1
        }
        Memory.lab[roomName].length=labs.length
        if(labs.length >= 3){
            Memory.lab[roomName].ctrol=true;
        }else{
            Memory.lab[roomName].ctrol=false;
        }  
    }
}