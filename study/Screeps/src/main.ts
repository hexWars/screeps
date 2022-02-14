import { mainUniversal } from './Universal/mainUniversal';
import { errorMapper } from './modules/errorMapper'
import "./modules/超级移动优化"
// import "./modules/strategy_marketPrice"

if (Game.flags.Appassionata){
    console.log(Game.time, 'Appassionata new push')
    let rooms: string[] = ['W14N12']
    for (let idx in rooms){
        Memory.rooms[rooms[idx]].check_spawn_queue_flag = true
    }
}

export const loop = errorMapper(() => {
    if (Game.shard.name == 'shard2'){
        if(Game.cpu.bucket == 10000) {
            Game.cpu.generatePixel();
        }
        return
    }
    if (Game.flags.Appassionata){
        if(Game.cpu.bucket == 10000) {
            Game.cpu.generatePixel();
        }
        let rooms: string[] = ['W14N12']
        mainUniversal(rooms)
    }
    // if (Game.flags.test){
    //     // todo
    //     Game.flags.test.remove()
    // }
})