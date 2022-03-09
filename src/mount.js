import {p_creep} from './mount/prototype_creep'
import {p_spawn} from './mount/structure/prototype_spawn'
import {p_room} from "./mount/prototype_room";
import {p_tower} from "./mount/structure/prototype_tower";


export const mount = function () {
	p_creep()
	p_spawn()
	p_room()
	p_tower()
}
