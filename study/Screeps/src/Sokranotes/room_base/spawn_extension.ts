export const spawn_extension_work = function(creep: Creep){
    _.assign(Spawn.prototype, spawn_extension)
}

const spawn_extension = {
    // 检查任务队列
    
}

Spawn.prototype.work = function() { 
    // 代码...
}

// 将生成任务推入队列
Spawn.prototype.addTask = function(taskName) { 
    // 代码...
}

// creep 生成主要实现
Spawn.prototype.mainSpawn = function(taskName) { 
    // 代码...
}