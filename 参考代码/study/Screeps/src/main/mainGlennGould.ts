import { mainUniversal } from './Universal/mainUniversal';
import { errorMapper } from './modules/errorMapper'
import "./modules/超级移动优化"
// import "./modules/strategy_marketPrice"

if (Game.flags.GlennGould){
    console.log(Game.time, 'GlennGould new push')
    let rooms: string[] = ['W9N11']
    for (let idx in rooms){
        Memory.rooms[rooms[idx]].check_spawn_queue_flag = true
    }
}

export const loop = errorMapper(() => {
    if (Game.flags.GlennGould){
        if(Game.cpu.bucket == 10000) {
            Game.cpu.generatePixel();
        }
        let rooms: string[] = ['W9N11']
        mainUniversal(rooms)
    }
    // if (Game.flags.v2){
    //     // todo
    //     Game.flags.v2.remove()
    // }
})
