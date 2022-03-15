let limit = {300: [], 550: [], 800: [], 1300: [], 1800: [], 2300: [], 5600: [], 10000: []}


export const config = {
	"E18S54": {
		upgrader: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "5bbcae039099fc012e6384c4",
			targetRoomName: "E18S54"
		},
		builder: {
			role: "builder",
			number: 0/*1*/,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		builder_lins: {
			role: "builder",
			number: 0/*1*/,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		harvester: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c3",
			selfRoomName: "E18S54",
			targetId: "622b167460854a9acbf2bdbe",
			targetRoomName: "E18S54"
		},
		harvester1: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae039099fc012e6384c5",
			selfRoomName: "E18S54",
			targetId: "622f49233dac222b8a07c48f",
			targetRoomName: "E18S54"
		},
		harvester2: {// mineral 矿场资源
			role: "harvester",
			number: 3,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcb37b40062e4259e94431",
			selfRoomName: "E18S54",
			targetId: "623039ecef7f9c58acebd978",
			targetRoomName: "E18S54"
		},
		carrier: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		carrie1: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, CARRY, CARRY, CARRY, CARRY],
			selfId: "623039ecef7f9c58acebd978",
			selfRoomName: "E18S54",
			targetId: "6229becbd834b5981b3b33d1",
			targetRoomName: "E18S54"
		},
		repairer: {
			role: "repairer",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK],
			selfId: "6229becbd834b5981b3b33d1",
			selfRoomName: "E18S54",
			targetId: "no",
			targetRoomName: "E18S54"
		},
		defender: {},
		occupier: {
			role: "occupier",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
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
				from: ["622b167460854a9acbf2bdbe", "622f49233dac222b8a07c48f"],
				to: []
			},
			Tower: {
				attack: [],
				repair: {
					"622815f682606a45aacde400": 25,
					"622abfe68d3e7624f42731e0": 25
				},
			}
		},


		harvester999: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae159099fc012e63864f",
			selfRoomName: "E19S54",
			targetId: "622dd62b6bc5f44dff635f60",
			targetRoomName: "E19S54"
		},
		harvester998: {
			role: "harvester",
			number: 1,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK, WORK],
			selfId: "5bbcae159099fc012e638650",
			selfRoomName: "E19S54",
			targetId: "622dc93c40d11b64bed29cdd",
			targetRoomName: "E19S54"
		},
		upgrader999: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "622dc93c40d11b64bed29cdd",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
		upgrader998: {
			role: "upgrader",
			number: 0,
			spawnName: "Spawn1",
			body: [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK, WORK],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
	},
	"E19S54": {
		occupier: {
			role: "occupier",
			number: 0,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, CARRY, WORK],
			selfId: "no",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		builder: {
			role: "builder",
			number: 0,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		builder1: {
			role: "builder",
			number: 0,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, WORK, WORK, WORK],
			selfId: "622dc93c40d11b64bed29cdd",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		upgrader: {
			role: "upgrader",
			number: 3,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, WORK, WORK, WORK, WORK],
			selfId: "622fb9f05aaf2c52db20731e",
			selfRoomName: "E19S54",
			targetId: "5bbcae159099fc012e63864e",
			targetRoomName: "E19S54"
		},
		carrier: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
			selfId: "622dc93c40d11b64bed29cdd",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},
		carrie1: {
			role: "carrier",
			number: 1,
			spawnName: "Spawn2",
			body: [MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
			selfId: "622dd62b6bc5f44dff635f60",
			selfRoomName: "E19S54",
			targetId: "no",
			targetRoomName: "E19S54"
		},

		structures: {
			Link: {
				center: "",
				from: [],
				to: []
			},
			Tower: {
				attack: [],
				repair: {
					"622ed20e8792ad7fb29012ec": 25
				},
			}
		},
	}

}


