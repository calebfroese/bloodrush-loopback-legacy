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
    player.first = createName(true);
    player.last = createName(false);
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

function createName(isFirstName) {

    var first = ['William', 'Bill', 'Brian', 'Eli', 'Jared', 'Jarrod', 'Craig', 'John', 'Jon', 'Blake', 'Nik', 'Freddie', 'Harry', 'Tim', 'Nick', 'Jerry', 'Lorenzo', 'Colin', 'Heath', 'Matt', 'Lucas', 'Billy', 'Calvin', 'Dan', 'Reginald', 'Gertrude', 'Roger', 'Kevin', 'Pete', 'Jake', 'Tom', 'Thomas', 'Darcy', 'Jay', 'Chris', 'Christopher', 'Richard', 'Charles', 'Robbie', 'Anthony', 'Tony', 'Steve', 'Damo', 'Wilson', 'Paul', 'Donald', 'Ted', 'Andrew', 'Drew', 'Jason', 'Jeffrey', 'Ryan', 'Gary', 'Jacob', 'Eric', 'Erik', 'Vladimir', 'Jonathan', 'Larry', 'Samuel', 'Sam', 'Benjamin', 'Ben', 'Patrick', 'Alex', 'Alexander', 'Dennis', 'Tyler', 'Aaron', 'Henry', 'Douglas', 'Peter', 'Dylan', 'Louis', 'Alan', 'Juan', 'Noah', 'Wayne', 'Ralph', 'Justin', 'Adrian', 'Bobby', 'Eugene', 'Aiden', 'Ethan', 'Mason', 'Caden', 'Oliver', 'Michael', 'Mike', 'Carter', 'Caleb', 'Jaiden', 'Isaac', 'Muhammed', 'Cameron', 'Wyatt', 'Nathan', 'Carlos', 'Julian', 'Owen', 'Christian', 'Brayden', 'Lincoln', 'Rod', 'Rodney', 'Freddy', 'Rico', 'Rick', 'Florentino', 'Filiberto', 'Derrick', 'Dustin', 'Danny', 'Randal', 'Leroy', 'Doyle', 'Colton', 'Tomas', 'Simon', 'Phillip', 'Phil', 'Jamal', 'Ronaldo', 'Kip', 'Leo', 'Sonny', 'Allan', 'Sean', 'Laurence', 'Jerrell', 'Miquel', 'Mickey', 'Bobbie', 'Harold', 'Cole', 'Hal', 'Alvin', 'Guy', 'Pierre', 'Jordan', 'Buster', 'Arnoldo', 'Arnold', 'Seb', 'Sebastian', 'Jae', 'Kirk', 'Victor', 'Gabriel', 'Giovanni', 'Maxwell', 'Max', 'Larry', 'Eddy', 'Augustus', 'Kendrick', 'Newton', 'Keneth', 'Elvis', 'Ed', 'Val', 'Eloy', 'Oscar', 'Chad', 'Lavern', 'Lyman', 'Jerrold', 'Danoli', 'Sheldon', 'Mitchell', 'Robin', 'Markus', 'Marcus', 'Gavin', 'Doug', 'Jeramy', 'Keenen', 'Ali', 'Norman', 'Anibal', 'Sal', 'Louie', 'Dion', 'Melvin', 'Mervin', 'Emanuel', 'Ezra', 'Harris', 'Irvin', 'Genaro', 'Ty', 'Cedric', 'Al', 'Vincenzo', 'Cliff', 'Curtis', 'Shawn', 'Corey', 'Korey', 'Brett', 'Theo', 'Damien', 'Earl', 'Lonnie', 'Willie', 'Marl', 'Jarvis', 'Erlich', 'Sandar', 'Tyson', 'Fletcher', 'Dudley', 'Luke', 'Jax', 'Stephen', 'Steven', 'Charles', 'Charlie', 'Adrian', 'Oliver', 'Owen', 'Nicholas', 'Connor', 'Ian', 'Dominick', 'Warren', 'Richy', 'Andy', 'Trevor', 'Leonard', 'Gordon', 'Jamie', 'Stewart', 'Stew', 'Piers', 'Liam', 'Shapa', 'Houston', 'Talley', 'Felix', 'Heinz', 'Franzes', 'Ernest', 'Walter', 'Bertilo', 'Dolph', 'Ralf', 'Natal', 'Maxmillen', 'Zane', 'Kane', 'Fletch', 'Elia', 'Clifford', 'Richardo', 'Hercules', 'Franz', 'Ronny', 'Egan', 'Pearce', 'Scotty', 'Alberto', 'Albert', 'Brendan', 'Brenden', 'Darren', 'Brigham', 'Daryl', 'Sid', 'Zed', 'Errick', 'Carmine', 'Jeff', 'Geoff', 'Osborn', 'Domingo', 'Allen', 'Randie', 'Thedrick', 'Lesley', 'Kit', 'Theodore', 'Braden', 'Bradley', 'Brad', 'Wolfy', 'Fransisco', 'Welch', 'Mohandas', 'Tracer', 'Antony', 'Charlton', 'Sidney', 'Drew', 'Patrice', 'Claud', 'Jakub', 'Nicklas', 'Arty', 'Dany', 'Lachlan', 'Iris', 'Syl', 'Nikolai', 'Jaden', 'Harris', 'Rolf', 'Rupert', 'Willis', 'Ray', 'Raymond', 'Elmer', 'Lee', 'Donald', 'Donarto', 'Herman', 'Kenneth', 'Hugh', 'Curtis', 'Levi', 'Malcolm', 'Cleveland', 'Gene', 'Elijah', 'Zucc', 'Titus', 'Cheenal', 'Xavier', 'Xander', 'Kofi', 'Fabio', 'Seamus', 'Antonio', 'Fillipe', 'Sergio', 'Kelechi', 'Yaya', 'Chou'];
    var last = ['Adams', 'Smith', 'Brown', 'Mason', 'Baker', 'Jackson', 'Banks', 'Brin', 'Winters', 'Marano', 'Bobrovski', 'Mays', 'Roy', 'Knupp', 'Bridgeman', 'Bross', 'Haynes', 'Johnson', 'Robson', 'Sidebottom', 'Hancock', 'Pierce', 'Lloyd', 'King', 'Harrison', 'Clark', 'Mason', 'Knight', 'Young', 'Simpson', 'Mills', 'Gibson', 'McDonald', 'Hill', 'Moore', 'Kennedy', 'Hart', 'MacIntyre', 'Spenson', 'Gardner', 'Butler', 'Scott', 'Hall', 'Lawrenson', 'Ellis', 'Sanders', 'Abbott', 'Benson', 'Dickson', 'Haines', 'Tomson', 'Thornton', 'Little', 'Welch', 'Lord', 'Donaldson', 'MacKenzie', 'Graham', 'Wentworth', 'Crook', 'Crowley', 'Cochrane', 'Pilkington', 'Holmes', 'McAuley', 'Green', 'Gonzales', 'Nelson', 'Carter', 'Turner', 'Phillips', 'Edwards', 'Collins', 'Cox', 'Ward', 'Brooks', 'Peterson', 'Patterson', 'Long', 'Washington', 'Stark', 'Bottomton', 'Jenkins', 'Simmons', 'Woods', 'Fisher', 'Cruz', 'Marshall', 'Gomez', 'Murray', 'Freeman', 'Ridley', 'Armstrong', 'Harper', 'Carpenter', 'Weaver', 'Elliot', 'Hoffman', 'Silva', 'Pearson', 'Byrd', 'Wade', 'Horton', 'Castro', 'Sutton', 'Bowen', 'Valdez', 'Stevenson', 'Cross', 'Mann', 'McGee', 'Cohen', 'Wan', 'Burgess', 'Elsandi', 'Cabot', 'Siegfried', 'Napoli', 'Farabella', 'Sperazo', 'Nagle', 'Landes', 'Luboski', 'Leoni', 'Stedman', 'Standman', 'Stafford', 'Faunch', 'De Boldo', 'Bold', 'Anchor', 'Chef', 'Resta', 'Featherson', 'Moffat', 'Bevin', 'Grandford', 'Harristead', 'Saintsbury', 'Cort', 'Smart', 'Caldorf', 'Mareen', 'White', 'Mitchells', 'Muello', 'Taratoni', 'Macaroni', 'Axel', 'Ciprano', 'Soprano', 'Fenn', 'Mann', 'Bigg', 'Martins', 'Hanson', 'Nardi', 'Preston', 'Preswell', 'Veneto', 'Benn', 'Hooley', 'Gladwood', 'Nixon', 'Holbrook', 'Brooks', 'Allman', 'Tambo', 'Asani', 'Camp', 'Blendon', 'Ceccaroni', 'Belloc', 'Flint', 'Arcus', 'Alfonso', 'Perlmann', 'Shimizo', 'Labors', 'Torphy', 'Weissman', 'Small', 'Lockwood', 'Drake', 'Newhall', 'Newton', 'De Veux', 'El Lare', 'Fett', 'Gregory', 'Englewood', 'Byfuglien', 'Ehlers', 'Wheeler', 'McRonald', 'De Leon', 'Atlington', 'Atkinson', 'Bishop', 'Blackburn', 'Bjorn', 'Marx', 'McAfee', 'McRoberts', 'Douglas', 'MacDouglas', 'Croker', 'Cox', 'Yano', 'Kingston', 'Kingswood', 'Eaglewood', 'Hawk', 'Turnbull', 'Adamo', 'Martin', 'Bernard', 'Dubois', 'Roberts', 'Hann', 'Garcia', 'Lefebvre', 'Girard', 'Morel', 'Garnier', 'Garner', 'Legrand', 'Guerin', 'Roussel', 'Perrin', 'Brun', 'Jeann', 'Marchand', 'Roland', 'Schmitt', 'Vidal', 'Dufour', 'Lacroix', 'Fabre', 'Da Silva', 'Deschamps', 'Carpentier', 'Benoit', 'Maillard', 'Marchal', 'Aubry', 'Vasseur', 'Redham', 'Collet', 'Laine', 'Guyot', 'Campbell', 'Coor', 'Parker', 'Gerhardt', 'Gerst', 'Glockner', 'Geissler', 'Geiger', 'Borchard', 'Brand', 'Ebner', 'Illiard', 'Faust', 'Ferner', 'Parner', 'Edham', 'Sly', 'Pavelski', 'McDavid', 'Crosby', 'Tarasenko', 'Panarin', 'Seguin', 'West', 'East', 'Matthews', 'Foligno', 'Saad', 'van Riemsdyk', 'Stone', 'Skinner', 'Short', 'Tall', 'Zuccarello', 'Koivu', 'Weber', 'Weiss', 'Drou', 'Reinhart', 'Luciks', 'Ristolain', 'Faboir', 'Zucker', 'Ajax', 'Vanek', 'Schultz', 'Bozak', 'Carlson', 'Carlton', 'Mohanen', 'Killorn', 'Perron', 'Perry', 'Holden', 'Letang', 'Bakes', 'Cogliano', 'Valve', 'Bontempelli'];

    var firstName = first[Math.floor(Math.random() * first.length)];
    var lastName = last[Math.floor(Math.random() * last.length)];

    return isFirstName ? firstName : lastName;
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