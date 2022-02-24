// import { active_transfer_work } from "./room_base/atcive_transfer";
import { base_transfer_work } from "./room_base/base_transfer";
import { builder_work } from "./room_base/builder";
import { carrier_W47S14_work} from "./carrier_W47S14";
import { cleaner_work } from "./room_base/cleaner";
import { energy_harvester_link_work } from "./room_base/energy_harvester_link";
// import { energy_harvester_no_carry_work } from "./room_base/energy_harvester_no_carry";
import { energy_harvester_with_carry_work } from "./room_base/energy_harvester_with_carry";
import { passive_transfer_work } from "./room_base/passive_transfer";
import { repairer_work } from "./room_base/repairer";
import { upgrader_link_work } from "./room_base/upgrader_link";

// import { out_soldier_work } from "@/Sokranotes/out_energy_mine/out_soldier";
import { out_scout_work } from './out_energy_mine/out_scout';
import { out_energy_harvester_with_carry_work } from './out_energy_mine/out_energy_harvester_with_carry';
import { out_passive_transfer_work } from './out_energy_mine/out_passive_transfer';
import { reserver_work } from './out_energy_mine/reserver';
import { attack_invader_core_work } from './out_energy_mine/attack_invader_core';

// import { miner_work } from "./mineral/miner";
// import { mine_transfer_work } from "./mineral/mine_transfer";
import { tower_transfer_work } from "./room_base/tower_transfer";

// import { new_room_help_work } from './war3 W48S12/new_room_help';
// import { claim_controller_work } from './war3 W48S12/claim_controller';
// import { attack_work } from './war3 W48S12/attack';
// import { carrier_help_work } from './room_base/carrier_help';
// import { scout_test_work } from "../history war/war4 W41S7/scout_test";
// import { move_compounds_work } from "./room_base/move_compounds";
// import { claim_controller_work } from "../history war/war4 W41S7/claim_controller";
// import { carrier1_W48S12_work } from "./room_base/carrier1_W48S12";
import { tmp_attack_work } from "./room_base/tmp_attack";
import { carrier_W48S12_work } from "./carrier_W48S12";
import { occupy_work } from "./occupy/occupy";
import { help_work } from "./room_base/help_worker";
import { carrier_W41S6_work } from "./carrier_W41S6";
import { harvest_upgrade_work } from "@/Universal/room_base/level1/harvest_upgrade_worker";
import { harvest_build_work } from "@/Universal/room_base/level2/harvest_build_worker";
import { move_compounds_work } from "./room_base/move_compounds";
import { nuker_transfer_work } from "./room_base/nuker_transfer";
// import { harvest_upgrade_work } from "./low_level/harvest_upgrade_worker";
// import { harvest_fill_work } from "./low_level/harvest_fill_worker";
// import { help_work } from "./room_base/help_worker";
// import { harvest_repair_work } from "./low_level/harvest_repair_worker";
// import { simple_one_machine_work } from "@/history war/war4 W41S7/simple_one_machine";
// import { simple_one_harder_work } from "@/history war/war4 W41S7/simple_one_harder";

export const different_role_work = function(){
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];

        // base running
        if (creep.memory.role == 'base_transfer'){
            base_transfer_work(creep)
        }
        if (creep.memory.role == 'tower_transfer'){
            tower_transfer_work(creep)
        }
        // 挖运分离
        else if (creep.memory.role == 'energy_harvester_with_carry'){
            energy_harvester_with_carry_work(creep)
        }
        else if (creep.memory.role == 'passive_transfer'){
            passive_transfer_work(creep)
        }
        // else if (creep.memory.role == 'energy_harvester_no_carry'){
        //     energy_harvester_no_carry_work(creep)
        // }
        // else if (creep.memory.role == 'active_transfer'){
        //     active_transfer_work(creep)
        // }
        else if (creep.memory.role == 'energy_harvester_link'){
            energy_harvester_link_work(creep)
        }
        else if (creep.memory.role == 'carrier_W47S14'){
            carrier_W47S14_work(creep)
        }
        else if (creep.memory.role == 'carrier_W41S6'){
            carrier_W41S6_work(creep)
        }
        else if (creep.memory.role == 'carrier_W48S12'){
            carrier_W48S12_work(creep)
        }
        // basic function
        else if(creep.memory.role == 'upgrader_link') {
            upgrader_link_work(creep);
        }
        else if(creep.memory.role == 'repairer') {
            repairer_work(creep); // later use tower
        }
        else if(creep.memory.role == 'builder') {
            builder_work(creep);
        }
        else if (creep.memory.role == 'cleaner'){
            cleaner_work(creep) // adjustment depend the conditon
        }
        else if (creep.memory.role == 'nuker_transfer'){
            nuker_transfer_work(creep)
        }


        // out energy
        else if (creep.memory.role == 'out_scout'){
            out_scout_work(creep)
        }
        else if (creep.memory.role == 'reserver'){
            reserver_work(creep)
        }
        else if (creep.memory.role == 'out_energy_harvester_with_carry')
        {
            out_energy_harvester_with_carry_work(creep)
        }
        else if (creep.memory.role == 'out_passive_transfer'){
            out_passive_transfer_work(creep)
        }
        // defense
        else if (creep.memory.role == 'attack_invader_core'){
            attack_invader_core_work(creep)
        }

        else if (creep.memory.role == 'occupy'){
            occupy_work(creep)
        }
        // Game.spawns['Spawn3'].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM], 'c', {memory: {role: 'occupy'}})
        else if (creep.memory.role == 'help'){
            help_work(creep)
        }
        // Game.spawns['Spawn4'].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE, MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'help' + Game.time, {memory: {role: 'help', source_idx: 0}})

        // else if (creep.memory.role == 'out_soldier'){
        //     out_soldier_work(creep)
        // }
        // else if (creep.memory.role == 'sign'){
        //     sign_work(creep)
        // }
        // else if (creep.memory.role == 'help'){
        //     help_work(creep)
        // }

        // else if (creep.memory.role == 'new_room_help'){
        //     new_room_help_work(creep)
        // }

        // else if (creep.memory.role == 'miner'){
        //     miner_work(creep)
        // }
        // else if (creep.memory.role == 'mine_transfer'){
        //     mine_transfer_work(creep)
        // }

        // low level
        else if (creep.memory.role == 'hu'){
            harvest_upgrade_work(creep)
        }
        else if (creep.memory.role == 'hb'){
            harvest_build_work(creep)
        }
        else if (creep.memory.role == 'hl'){
            energy_harvester_link_work(creep)
        }
        // else if (creep.memory.role == 'hf'){
        //     harvest_fill_work(creep)
        // }
        // else if (creep.memory.role == 'hr'){
        //     harvest_repair_work(creep)
        // }

        // else if (creep.memory.role == 'v2'){
        //     test_work(creep)
        // }

        // war 4 W41S7
        // else if (creep.memory.role == 'scout_test'){
        //     scout_test_work(creep)
        // }
        // else if (creep.memory.role == 'simple_one_machine'){
        //     simple_one_machine_work(creep)
        // }
        // else if (creep.memory.role == 'simple_one_harder'){
        //     simple_one_harder_work(creep)
        // }
        else if (creep.memory.role == 'move_compounds'){
            move_compounds_work(creep)
        }
        // else if (creep.memory.role == 'claim_controller'){
        //     claim_controller_work(creep)
        // }

        // tmp
        else if (creep.memory.role == 'tmp_attack'){
            tmp_attack_work(creep)
        }
    }
}
