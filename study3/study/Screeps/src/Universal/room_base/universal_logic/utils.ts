import { errorMapper } from '../../../modules/errorMapper'

global.harvest_err_code = new Map([
    [0, 'OK'],
    [-1, 'ERR_NOT_OWNER'],
    [-4, 'ERR_BUSY'],
    [-5, 'ERR_NOT_FOUND'],
    [-6, 'ERR_NOT_ENOUGH_RESOURCES'],
    [-7, 'ERR_INVALID_TARGET'],
    [-9, 'ERR_NOT_IN_RANGE'],
    [-11, 'ERR_TIRED'],
    [-12, 'ERR_NO_BODYPART']
])

export const print_err_info = errorMapper(() => {
    let e = new Error()
    throw e
})
