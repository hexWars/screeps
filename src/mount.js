import {p_creep} from './mount/prototype_creep'
import {p_spawn} from './mount/structure/prototype_spawn'
import {p_room} from "./mount/prototype_room";


export const mount = function () {
	p_creep()
	p_spawn()
	p_room()
}
