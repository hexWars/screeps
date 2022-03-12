

let limit = { 300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5600: [], 10000: [] }


export const config = {
	"E18S54": {
		upgrader: {
			role: "upgrader",
			number: 3,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		upgrader1: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "622853b3cf799d2fc73d8630",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		builder: {
			role: "builder",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, CARRY, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		harvester: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c3",
			selfRoomName: "E18S54",
			targetId: "622b167460854a9acbf2bdbe",
			targetRoomName: "E18S54"
		},
		harvester1: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c5",
			selfRoomName: "E18S54",
			targetId: "622853b3cf799d2fc73d8630",
			targetRoomName: "E18S54"
		},
		carrier: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, CARRY, CARRY],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		carrier1: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
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
			role: "occupier",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CLAIM, ATTACK],
			selfId: "no",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		center: {
			role: "center",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "622b08d96825c6e51cd766ed",// link
			selfRoomName: "E18S54",
			targetId: "6229becbd834b5981b3b33d1",// storage
			targetRoomName: "E18S54"
		},
		structures: {
			Link: {
				center: "622b08d96825c6e51cd766ed",
				from: ["622b167460854a9acbf2bdbe"],
				to: []
			},
			Tower: {
				attack: [],
				repair: {
					"622815f682606a45aacde400": 25,
					"622abfe68d3e7624f42731e0": 25
				},
			}
		}
	}

}


