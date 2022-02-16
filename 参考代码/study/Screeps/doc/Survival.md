# Survival

玩到后面，浏览器疯狂alt+1 alt+2 alt+3切换，无法停止，F5一按回到解放前，直接决定不等半价了。

### 已经完成的工作：

- 解决Harvester为0时，Harvester无法生成的问题
  - 原因：newName没声明

### 需要完善的工作：

##### 近期


- 组件随可用能源和总能源容量进行变化，代码优化
- 防御的建立
- 控制器升级相关
- 能源点能源耗尽的问题
- 采集资源和其他任务解耦

##### 长远

- 任务驱动设计模式
- 组件自动调整功能完善
- 闲置角色改变角色完善
- 寻找更近且闲置的能源点
- 根据工作量进行控制creep的生成
- 防御的自动维护
- 攻击部队生成

#### 信息：

##### 建造对应部件所需能量

[WORK] 100

[CARRY] 50

[MOVE] 50

[WORK, CARRY, MOVE] 200

[WORK, WORK, CARRY, MOVE] 300

extension 3000

路 300

### 移动：

除了 `MOVE` 外， Creep 的每一个构造部件都有重量：带的部件越多，移动速度越慢。每个部件（除了 `MOVE`）都都会产生疲劳值：在道路上为 1 点，平原上为 2 点，沼泽里为 10 点。每一个 MOVE 部件每个游戏 tick 会减少 2 点疲劳值，当 Creep 的疲劳值大于 0 时无法移动。

> 如果要保证 Creep 每个游戏 tick 能移动一格，需要计算除 `MOVE` 外的所有部件的疲劳值总和并使 `MOVE` 减少的疲劳值不低于这个总和。

换句话说，一个 `MOVE` 部件在每个 tick 可以移动其他部件一个方格。如果一个 Creep 的 `MOVE` 部件不足，他的移动力会按比例减速，这可以通过疲劳度来看出。

值得注意的是，没有搬运资源的 `CARRY` 部件是不会产生疲劳的。

几个小例子：

- Creep `[CARRY, WORK, MOVE]` 在没有搬运能量的时候一个 tick 可以跑 1 格，搬了能量以后 2 个 tick 才能跑 1 格。
- Creep `[TOUGH, ATTACK, ATTACK, MOVE, MOVE, MOVE]` 将以满速（1 个 tick 一格）行动。
- Creep `[TOUGH, ATTACK, ATTACK, MOVE, MOVE]` 根据向上取整原则 2 个 tick 移动 1 格。

### 手动survival代码

##### main

```javascript
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleRepairer = require('role.repairer');
var harvestersNum = 3;
;
var upgradersNum = 4;
var repairersNum = 0;
var buildersNum = 4;
module.exports.loop = function () {
  // console.log(Game.spawns['Spawn1'].room.energyAvailable)
  // console.log(Game.rooms['sim'].name)
  // console.log(Game.rooms['sim'].energyAvailable)

  // console.log(Math.random())

  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }

  var ec = Game.rooms['sim'].energyCapacityAvailable;
  // console.log(ec);
  var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  // console.log(harvesters.length);
  // console.log(harvesters.length < harvestersNum);
  if (harvesters.length == 0) {
    var newName = 'Harvester' + Game.time;
    console.log(Game.rooms['sim'].energyAvailable);
    // console.log(parseInt(ec/100)*100);
    // console.log(Game.rooms['sim'].energyAvailable <= parseInt(ec/100)*100);
    if (Game.rooms['sim'].energyAvailable >= 600) {
      Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
      console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
    } else if (Game.rooms['sim'].energyAvailable >= 500) {
      Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
      console.log('Spawning new harvester WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
    } else if (Game.rooms['sim'].energyAvailable >= 400) {
      Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
      console.log('Spawning new harvester WORK, WORK, WORK, CARRY, MOVE: ' + newName);
    } else {
      Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
      console.log('Spawning new harvester WORK, WORK, CARRY, MOVE: ' + newName);
    }
  }
  // console.log('energyAvailable:' + Game.rooms['sim'].energyAvailable + " energyCapacityAvailable:" + parseInt(ec/100)*100);
  // console.log(Game.rooms['sim'].energyAvailable + " " + parseInt(ec/100)*100);
  if (Game.rooms['sim'].energyAvailable >= parseInt(ec / 100) * 100) {
    console.log('energy full');

    console.log('Harvesters: ' + harvesters.length);
    // console.log(harvesters.length);
    // console.log(harvestersNum);
    // console.log(harvesters.length < harvestersNum);

    var upgrader = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    console.log('Upgraders: ' + upgrader.length);

    var repairer = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer');
    console.log('Repairer: ' + repairer.length);

    var builder = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    console.log('Builders: ' + builder.length);

    if (Game.spawns['Spawn1'].spawning) {
      console.log('spawning');
    } else if (harvesters.length < harvestersNum) {
      var newName = 'Harvester' + Game.time;
      // console.log(Game.time);
      // console.log(newName);
      // console.log(parseInt(ec/100)*100);
      // console.log(parseInt(ec/100)*100 == 300);
      // console.log(parseInt(ec/100)*100 == 400);
      // console.log(parseInt(ec/100)*100 == 500);
      if (parseInt(ec / 100) * 100 == 300) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 400) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 500) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 600) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 650) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 700) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 750) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable >= 800) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'harvester'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE: ' + newName);
      }
    } else if (upgrader.length < upgradersNum) {
      var newName = 'Upgrader' + Game.time;
      var sou = 0;
      if (Math.random() < 0.75) {
        sou = 0;
      } else {
        sou = 3;
      }
      if (parseInt(ec / 100) * 100 == 300) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'upgrader', source: sou}});
        console.log('Spawning new upgrader WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 400) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new upgrader WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 500) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new upgrader WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 >= 600) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new upgrader WORK, WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 650) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 700) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 750) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable >= 800) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {
          memory: {
            role: 'upgrader',
            source: sou
          }
        });
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE: ' + newName);
      }
    } else if (repairer.length < repairersNum) {
      var newName = 'Repairer' + Game.time;
      if (parseInt(ec / 100) * 100 == 300) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new builder WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 400) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new builder WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 500) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new builder WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 600) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new builder WORK, WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 650) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 700) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 750) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable >= 800) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'repairer'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE: ' + newName);
      }
    } else if (builder.length < buildersNum) {
      var newName = 'Builder' + Game.time;
      if (parseInt(ec / 100) * 100 == 300) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new builder WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 400) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new builder WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 500) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new builder WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (parseInt(ec / 100) * 100 == 600) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new builder WORK, WORK, WORK, WORK, WORK, CARRY, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 650) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 700) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable == 750) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE: ' + newName);
      } else if (Game.rooms['sim'].energyAvailable >= 800) {
        Game.spawns['Spawn1'].spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], newName, {memory: {role: 'builder'}});
        console.log('Spawning new harvester WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE: ' + newName);
      }
    }
  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run();
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run();
    }
    if (creep.memory.role == 'repairer') {
      roleRepairer.run();
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run();
    }
  }
}

```

##### role.builder

```javascript
var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
	        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length) {
                if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
	    }
	    else {
	       // var targets = creep.room.find(FIND_STRUCTURES, {
        //         filter: (structure) => {
        //             // return (structure.structureType == STRUCTURE_CONTAINER) && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;//过滤器找到非空的建筑
        //             return (structure.structureType == STRUCTURE_CONTAINER);//过滤器找到非空的建筑
        //         }
        //     });
        //     if(targets.length > 0) {
        //         if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //             creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        //         }
        //     }
        //     else{
        //         // creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffffff'}});
        //         creep.moveTo(new RoomPosition(23, 26, 'sim'), {visualizePathStyle: {stroke: '#ffffff'}});
        //     }
            
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }
            else{
                creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffffff'}});
            }
	    }
	}
};

module.exports = roleBuilder;
```

##### role.harvester

```javascript
var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.store.getFreeCapacity() > 0) {
	    // if(creep.memory.source == 0) {
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});//显示路径
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER ||
                                structure.structureType == STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;//过滤器找到extension或spawn类型且空间未满的建筑
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{
                creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleHarvester;

```

##### role.upgrader

```javascript
var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
	   // if(creep.store[RESOURCE_ENERGY] != creep.store.getCapacity()) {
	   // if(creep.store[RESOURCE_ENERGY] == 0) {
	   if (creep.store.getFreeCapacity() > 0){
            var sources = creep.room.find(FIND_SOURCES);
            // if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            //     creep.moveTo(sources[0]);
            // }
            if (creep.memory.source == 0){
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[0]);
                }
            }
            else{
                if(creep.harvest(sources[3]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[3]);
                }
            }
        }
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {//距离够则升级控制器
                creep.moveTo(creep.room.controller);
            }
        }
	}
};

module.exports = roleUpgrader;

```

##### role.repairer

```
var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep){
        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 repair');
        }

        if(creep.memory.building) {
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            });
            if(target) {
                if(creep.repair(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            // else{
            //     creep.memory.role = 'builder';
            // }
        }
        else {
            var source = creep.pos.findClosestByPath(FIND_SOURCES);
            if(source && creep.harvest(source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleRepairer;

```

### reference

[Screeps Survival](https://screeps.com/a/#!/sim/survival)

[Screeps Tutorial](https://screeps.com/a/#!/sim/tutorial)

[Screeps中文文档 Creeps](https://screeps-cn.github.io/creeps.html)
