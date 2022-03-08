

let limit = { 300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5600: [], 10000: [] }

let setting = {
	"E54N12": {
		"harvest": {
			6: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY],
			7: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY],
			8: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY]
		},
		"upgrader": {
			6: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
			7: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
			8: []
		},
		"builder": {
			6: [],
			7: [],
			8: []
		},
		"carrier": {
			6: [],
			7: [],
			8: []
		},
		"repairer": {
			6: [],
			7: [],
			8: []
		},
		"defender": {
			6: [],
			7: [],
			8: []
		},
		"occupier": {
			6: [],
			7: [],
			8: []
		},
	},
	"ALL": {
		"harvest": {
			4: ["11"],
			5: [],
			6: [],
			7: [],
			8: []
		},
		"upgrader": {
			4: [],
			5: [],
			6: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY],
			7: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
			8: []
		},
		"builder": {
			4: [],
			5: [],
			6: [],
			7: [],
			8: []
		},
		"carrier": {
			4: [],
			5: [],
			6: [],
			7: [],
			8: []
		},
		"repairer": {
			4: [],
			5: [],
			6: [],
			7: [],
			8: []
		},
		"defender": {
			4: [],
			5: [],
			6: [],
			7: [],
			8: []
		},
		"occupier": {
			4: [],
			5: [],
			6: [],
			7: [],
			8: []
		},
	}



};

module.exports = setting;


