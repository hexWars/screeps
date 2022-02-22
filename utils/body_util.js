let mp = new Map();
mp.set("WORK", 100);
mp.set("MOVE", 50);
mp.set("CARRY", 50);
mp.set("ATTACK", 80);
mp.set("RANGED_ATTACK", 150);
mp.set("HEAL", 250);
mp.set("CLAIM", 600);
mp.set("TOUGH", 10);

let work = 4
let move = 2
let carry = 2
let attack = 0
let ranged_attack = 0
let heal = 0
let claim = 0
let tough = 0

let body = []
let i
for (i = 0; i < work; i++) {
	body.push("WORK")
}
for (i = 0; i < move; i++) {
	body.push("MOVE")
}
for (i = 0; i < carry; i++) {
	body.push("CARRY")
}
for (i = 0; i < attack; i++) {
	body.push("ATTACK")
}
for (i = 0; i < ranged_attack; i++) {
	body.push("RANGED_ATTACK")
}
for (i = 0; i < heal; i++) {
	body.push("HEAL")
}
for (i = 0; i < claim; i++) {
	body.push("CLAIM")
}
for (i = 0; i < tough; i++) {
	body.push("TOUGH")
}

let sum = 0
for (let j = 0; j < body.length; j++) {
	if (j === 0) {
		process.stdout.write(body[j]);
	} else {
		process.stdout.write("," + body[j]);
	}
	sum += mp.get(body[j])
}

console.log()
console.log(sum)


