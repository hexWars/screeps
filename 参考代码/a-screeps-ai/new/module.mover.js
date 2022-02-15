function goToRoom(creep,roomname){
    if(creep.room.name==roomname){       
        if(creep.pos.x==0){creep.move(RIGHT);return false}
        if(creep.pos.x==49){creep.move(LEFT);return false}
        if(creep.pos.y==0){creep.move(BOTTOM);return false}
        if(creep.pos.y==49){creep.move(TOP);return false}
        delete Memory.mypath[creep.name]
        return true;
    }else{
        if(Memory.mypath[creep.name]&&Game.time%15==0){delete Memory.mypath[creep.name]}
        if(Memory.mypath[creep.name]){movePath(creep,Memory.mypath[creep.name]);return false}
        let to = new RoomPosition(25, 25, roomname);
        let allowedRooms = { [ creep.room.name ]: true };
        Game.map.findRoute(creep.room, to.roomName, {
            routeCallback(roomName) {
                if(Memory.roomsToAvoid[roomName]) {    // 回避这个房间
                    return Infinity;
                }
                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                let isHighway = (parsed[1] % 10 === 0) || 
                                (parsed[2] % 10 === 0);
                let isMyRoom = Game.rooms[roomName] &&
                    Game.rooms[roomName].controller &&
                    Game.rooms[roomName].controller.my;
                if (isHighway || isMyRoom) {
                    return 1;
                } else {
                    return 2.5;
                }
            }
        }).forEach(function(info) {
            allowedRooms[info.room] = true;
        });       
        let ret = PathFinder.search(creep.pos, to, {
            plainCost: 2,
            swampCost: 10,
            roomCallback(roomName) {
                if (allowedRooms[roomName] === undefined) {
                    return false;
                }
                let room = Game.rooms[roomName];
                if (!room) return;
                let costs = new PathFinder.CostMatrix;
                room.find(FIND_STRUCTURES).forEach(function(struct) {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    // 相对于平原，寻路时将更倾向于道路
                    costs.set(struct.pos.x, struct.pos.y, 1);
                  } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                             (struct.structureType !== STRUCTURE_RAMPART ||
                              !struct.my)) {
                    // 不能穿过无法行走的建筑
                    costs.set(struct.pos.x, struct.pos.y, 0xff);
                  }
                });
                room.find(FIND_MY_CREEPS).forEach(creeps => {costs.set(creeps.pos.x, creeps.pos.y, 0);});
                return costs;
            }
        });
        if(ret.path.length > 0){
            let pos = ret.path[0];
            creep.move(creep.pos.getDirectionTo(pos));
            Memory.mypath[creep.name]=ret.path
            return false;
        }else{
            console.log(creep.name+' is No Path'+creep.pos);
            return false;
        }
    } 
}
function movePath(creep,path){
    const pos = new RoomPosition(path[0].x, path[0].y, path[0].roomName);
    const pos1 = new RoomPosition(path[1].x, path[1].y, path[1].roomName);
    if(creep.pos.isEqualTo(pos)){path.shift();Memory.mypath[creep.name]=path;creep.move(creep.pos.getDirectionTo(pos1));return true}
    if(creep.move(creep.pos.getDirectionTo(pos))==OK){path.shift();Memory.mypath[creep.name]=path;return true}
}

//boost
function Toboost(creep){
    var boosttpe=[]
    if(creep.memory.role=='upgrader')boosttpe.push("XGH2O")
    else{
        if(creep.getActiveBodyparts(ATTACK)>0)boosttpe.push("XUH2O")
        if(creep.getActiveBodyparts(RANGED_ATTACK)>0)boosttpe.push("XKHO2")
        if(creep.getActiveBodyparts(HEAL)>0)boosttpe.push("XLHO2")
        if(creep.getActiveBodyparts(MOVE)>0)boosttpe.push("XZHO2")
    }
    if(boosttpe.length){
        var lab=_.filter(creep.room.lab,lab=>lab.store[boosttpe[0]]>0)
        if(lab.length){
            if(lab[0].boostCreep(creep)==ERR_NOT_IN_RANGE)creep.moveTo(lab[0])
            else if(lab[0].boostCreep(creep)==OK)boosttpe.shift()
        }else{boosttpe.shift()}
    }else{
        creep.memory.boost=true;
    }
}
//removeboost
function recyclemyself(creep){
    var spawn=creep.pos.findClosestByPath(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_SPAWN)})
    if(spawn){
        creep.moveTo(spawn)
        if(creep.pos.isNearTo(spawn))spawn.recycleCreep(creep)
    }
}

PowerCreep.prototype.goToRoom = function (roomname) {
    return goToRoom(this, roomname);
};
Creep.prototype.goToRoom = function (roomname) {
    return goToRoom(this, roomname);
};
Creep.prototype.recyclemyself = function () {
    return recyclemyself(this);
};
Creep.prototype.Toboost = function () {
    return Toboost(this);
};














/**ps:
1.如果想进行非对穿寻路
creep.moveTo(target,{ignoreCreeps:false})
2.对于不想被对穿的creep（比如没有脚的中央搬运工）, 设置memory：
creep.memory.no_pull = true
 */

var config = {
    changemove: true,//实现对穿
    changemoveTo: true,//优化moveTo寻路默认使用ignoreCreep=true
    roomCallbackWithoutCreep:undefined,//moveTo默认使用的忽视creep的callback函数
    roomCallbackWithCreep: undefined,//moveTo默认使用的计算creep体积的callback函数
    changeFindClostestByPath: true,  //修改findClosestByPath 使得默认按照对穿路径寻找最短
    reusePath: 10 //增大默认寻路缓存
}

if (config.changemove) {
    // Store the original method
    let move = Creep.prototype.move;
    // Create our new function
    Creep.prototype.move = function (target) {
        // target可能是creep（在有puller的情况下），target是creep时pos2direction返回undefined
        const tarpos = pos2direction(this.pos, target);
        
        if (tarpos) {
            let direction = +target;
            const tarcreep = tarpos.lookFor(LOOK_CREEPS)[0] || tarpos.lookFor(LOOK_POWER_CREEPS)[0]
            if (tarcreep && this.ignoreCreeps) {
                if (tarcreep.my && !tarcreep.memory.no_pull){
                    // 挡路的是我的creep/powerCreep, 如果它本tick没移动则操作它对穿
                    if (!tarcreep.moved && move.call(tarcreep, (direction + 3) % 8 + 1) == ERR_NO_BODYPART){
                        // 如果对方是个没有脚的球
                        if(this.pull){
                            // 自己是creep, 就pull他一下 （powerCreep没有pull方法，会堵车）
                            this.pull(tarcreep);
                            move.call(tarcreep, this);
                        }
                    }
                }else if(Game.time&1 && this.memory._move && this.memory._move.dest){
                    // 别人的creep，如果在Memory中有正在reuse的路径（即下一tick本creep还会尝试同样移动），则1/2概率清空路径缓存重新寻路
                    let dest = this.memory._move.dest;
                    let pos = new RoomPosition(dest.x, dest.y, dest.room);
                    if(pos.x != tarpos.x || pos.y != tarpos.y || pos.roomName != tarpos.roomName){
                        // 如果最终目标位置不是当前这一步移动的目标位置（如果是的话绕路也没用）
                        let path = this.pos.findPathTo(pos);
                        if(path.length){
                            this.memory._move.time = Game.time;
                            this.memory._move.path = Room.serializePath(path);
                            return move.call(this, path[0].direction);
                        }
                    }
                }
            }
        }

        this.moved = true;
        return move.call(this, target);
    }
    
    PowerCreep.prototype.move = function (target) {
        if (!this.room) {
            return ERR_BUSY;
        }
        return Creep.prototype.move.call(this, target);
    }
}

if (config.changemoveTo) {
    let moveTo = Creep.prototype.moveTo;
    Creep.prototype.moveTo = function (firstArg, secondArg, opts) {
        let ops = {};
        if (_.isObject(firstArg)) {
            ops = secondArg || {};
        } else {
            ops = opts || {};
        }
        if (!ops.reusePath) {
            ops.reusePath = config.reusePath;
        }
        if (ops.ignoreRoads) {
            ops.plainCost = 1;
            ops.swampCost = 5;
        }else if(ops.ignoreSwanp){
            ops.plainCost = 1;
            ops.swampCost = 1;
        }
        if (ops.ignoreCreeps === undefined || ops.ignoreCreeps === true) {
            this.ignoreCreeps = true;
            ops.ignoreCreeps = true;
            ops.costCallback = config.roomCallbackWithoutCreep;
        } else {
            ops.costCallback = config.roomCallbackWithCreep;
        }

        if (_.isObject(firstArg)) {
            return moveTo.call(this, firstArg, ops);
        } else {
            return moveTo.call(this, firstArg, secondArg, ops);
        }
    }

    PowerCreep.prototype.moveTo = function (firstArg, secondArg, opts) {
        if (!this.room) {
            return ERR_BUSY;
        }
        let ops = {};
        if (_.isObject(firstArg)) {
            ops = secondArg || {};
        } else {
            ops = opts || {};
        }
        if (!ops.reusePath) {
            ops.reusePath = config.reusePath;
        }
        ops.plainCost = 1;
        ops.swampCost = 1;
        if (_.isObject(firstArg)) {
            return moveTo.call(this, firstArg, ops)
        } else {
            return moveTo.call(this, firstArg, secondArg, ops)
        }
    }
}

if (config.changeFindClostestByPath) {
    let origin_findClosestByPath = RoomPosition.prototype.findClosestByPath;
    RoomPosition.prototype.findClosestByPath = function (type, opts) {
        opts = opts || {};
        if (opts.ignoreCreeps === undefined || opts.ignoreCreeps === true) {
            opts.ignoreCreeps = true;
            opts.costCallback = config.roomCallbackWithoutCreep;
        } else {
            opts.costCallback = config.roomCallbackWithCreep;
        }
        return origin_findClosestByPath.call(this, type, opts);
    }
}

function pos2direction(pos, target) {
    if(_.isObject(target)){
        // target 不是方向常数
        return undefined;
    }
    
    const direction = +target;  // 如果是string则由此运算转换成number
    let tarpos = {
        x: pos.x,
        y: pos.y,
    }
    if (direction !== 7 && direction !== 3) {
        if (direction > 7 || direction < 3) {
            --tarpos.y
        } else {
            ++tarpos.y
        }
    }
    if (direction !== 1 && direction !== 5) {
        if (direction < 5) {
            ++tarpos.x
        } else {
            --tarpos.x
        }
    }
    if (tarpos.x < 0 || tarpos.y > 49 || tarpos.x > 49 || tarpos.y < 0) {
        return undefined;
    } else {
        return new RoomPosition(tarpos.x, tarpos.y, pos.roomName);
    }
}











