

let limit = { 300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5600: [], 10000: [] }


export const config = {
	"E18S54": {
		upgrader: {
			role: "upgrader",
			number: 3,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
			selfId: "62284cb82f2a4ab633b7f42a",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		upgrader1: {
			role: "upgrader",
			number: 2,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
			selfId: "622853b3cf799d2fc73d8630",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		builder: {
			role: "builder",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, WORK, WORK],
			selfId: "622853b3cf799d2fc73d8630",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		harvester: {
			role: "harvester",
			number: 2,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c3",
			selfRoomName: "E18S54",
			targetId: "62284cb82f2a4ab633b7f42a",
			targetRoomName: "E18S54"
		},
		harvester1: {
			role: "harvester",
			number: 2,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c5",
			selfRoomName: "E18S54",
			targetId: "622853b3cf799d2fc73d8630",
			targetRoomName: "E18S54"
		},
		carrier: {
			role: "carrier",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "62284cb82f2a4ab633b7f42a",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		carrier1: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "622853b3cf799d2fc73d8630",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		repairer: {
		},
		defender: {
		},
		occupier: {
		},
		structureIds: {
			centerLink: ""
		}
	}

}


