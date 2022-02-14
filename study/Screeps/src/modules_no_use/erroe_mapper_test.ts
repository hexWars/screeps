import { errorMapper } from '../modules/errorMapper'

export const test = errorMapper(() => {
    let e = new Error()
    let info = e.stack.split('\n')[2]
    console.log(Game.time, info)
    console.log(e.stack)
    throw e
})