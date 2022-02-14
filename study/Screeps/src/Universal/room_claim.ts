export const room_claim = function(roomName: string){
    if (Memory.rooms[roomName] == undefined) Memory.rooms[roomName] = {}
    if ((Game.rooms[roomName] == undefined || 
        (Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my != true)) 
        && Memory.rooms[roomName].claiming == undefined){
        
    }
    else if (Game.rooms[roomName] != undefined && Game.rooms[roomName].controller == undefined){
        console.log(roomName, ' no controller, can\'t claim.')
    }
}