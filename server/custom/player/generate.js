var faker = require('faker');

module.exports = {
    createPlayer: () => {
        return createPlayer();
    }
}

function createPlayer() {    
    var player = { }
    // Luck
    var luck = genLuck();
    // Name
    player.first = faker.name.firstName(0);
    player.last = faker.name.lastName();
    player.country = faker.address.country();
    // Speed / Weight
    var weightSpeedObj = genWeight(luck);
    player.spd = weightSpeedObj.spd;
    player.kg = weightSpeedObj.kg;
    // Atk / Def
    var atkDefObj = genAtkDef(luck);
    player.atk = atkDefObj.atk;
    player.def = atkDefObj.def;
    // Recovery rate
    player.rec = genNumber(0, 30);
    return player;
}

function genNumber(min, max) {
    // Generates a random number between variables
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genLuck() {
    // LUCK PERCENT
    var rand = genNumber(0, 100);
    var luck;

    if(rand < 2) {
        // 2%
        luck = genNumber(0, 30);
    } else if(rand < 10) {
        // 8%
        luck = genNumber(30, 50);
    } else if(rand < 26) {
        // 16%
        luck = genNumber(50, 55);
    } else if(rand < 5) {
        // 24%
        luck = genNumber(55, 65);
    } else if(rand < 74) {
        // 24%
        luck = genNumber(65, 70);
    } else if(rand < 90) {
        // 16%
        luck = genNumber(70, 75);
    } else if(rand < 98) {
        // 8%
        luck = genNumber(75, 85);
    } else {
        // 2%
        luck = genNumber(85, 100);
    }
    return luck
}

function genWeight(luck) {
    var luckElement = genNumber(0, luck) / 4;

    var spd = genNumber(50, 100);
    var kgRatio = 1 - (spd - 50) / 50;
    var kgLowest = 60 + (kgRatio * genNumber(10, 30));
    var kgHighest = kgLowest + 10 + (kgRatio * genNumber(30, 100));
    var kg = genNumber(kgLowest, kgHighest);
    return { spd: Math.floor(spd + luckElement), kg: Math.floor(kg + luckElement) }
}

function genAtkDef(luck) {
    var luckElement = genNumber(0, luck) / 3;

    var atk = genNumber(50, 100);
    var atkRatio = 1 - (atk - 50) / 50;
    var def = 50 + genNumber(50 * atkRatio, 100 * atkRatio);
    return { atk: Math.floor(atk + luckElement), def: Math.floor(def + luckElement) }
}