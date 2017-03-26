var faker = require('faker');

module.exports =
    {
      createPlayer: (bad) => {
        return createPlayer(bad);
      }
    }

function createPlayer(bad) {
  var player = {}
  // Luck
  var luck = bad ? genLuck() / 2 : genLuck();
  // Name
  player.first = faker.name.firstName(0);
  player.last = faker.name.lastName();
  player.country = genCountry();
  // Speed / Weight
  player.spd = Math.floor(genNumber(30, bad ? 80 : 100) + luck / 4);
  player.kg = Math.floor(genNumber(80, bad ? 105 : 120));
  // Atk / Def
  player.atk = Math.floor(genNumber(30, bad ? 80 : 100) + luck / 4);
  player.def = Math.floor(genNumber(30, bad ? 80 : 100) + luck / 4);
  // Recovery rate
  player.rec = Math.floor(genNumber(0, 30));
  return player;
}

function
genCountry() {
  if (Math.random() > 0.7) {
    // Use a common known country
    var countries = [
      'Australia', 'USA', 'England', 'France', 'USA', 'Spain', 'Japan', 'China',
      'New Zealand', 'Canada', 'Germany', 'Italy'
    ];
    return countries[0, Math.floor(Math.random() * countries.length)]
  } else {
    // Use a random country
    return faker.address.country()
  }
}

function genNumber(min, max) {
  // Generates a random number between variables
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function
genLuck() {
  // LUCK PERCENT
  var rand = genNumber(0, 100);
  var luck;

  if (rand < 2) {
    // 2%
    luck = genNumber(0, 30);
  } else if (rand < 10) {
    // 8%
    luck = genNumber(30, 50);
  } else if (rand < 26) {
    // 16%
    luck = genNumber(50, 55);
  } else if (rand < 5) {
    // 24%
    luck = genNumber(55, 65);
  } else if (rand < 74) {
    // 24%
    luck = genNumber(65, 70);
  } else if (rand < 90) {
    // 16%
    luck = genNumber(70, 75);
  } else if (rand < 98) {
    // 8%
    luck = genNumber(75, 85);
  } else {
    // 2%
    luck = genNumber(85, 100);
  }
  return luck
}
