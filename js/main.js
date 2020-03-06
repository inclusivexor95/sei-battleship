const game = {};

game.player1ShipLocations = {};
game.player2ShipLocations = {};

game.unacceptableLocations = [11, 12, 23, 24, 35, 36, 47, 48, 59, 60, 71, 72, 83, 84, 95, 96, 107, 108, 119, 120];

const UP = -12;
const DOWN = 12;
const LEFT = -1;
const RIGHT = 1;

game.directions = ['up', 'down', 'left', 'right'];

game.ships = {
    carrier: 5,
    battleship: 4,
    destroyer: 3,
    submarine: 3,
    patrolBoat: 2
};

game.welcomeHTML = `<div id="welcome">
<h2>Welcome to Matt's Battleship game. Would you like to play vs the computer or another player?</h2>
<button id="computerButton">Computer</button>
<button id="playerButton">Player</button>
</div>`;

game.shipHTML = `<div class="shipContainer" id="carrierContainer">
<div class="ship" id="carrier"></div>
</div>
<div class="shipContainer" id="battleshipContainer">
<div class="ship" id="battleship"></div>
</div>
<div class="shipContainer" id="destroyerContainer">
<div class="ship" id="destroyer"></div>
</div>
<div class="shipContainer" id="submarineContainer">
<div class="ship" id="submarine"></div>
</div>
<div class="shipContainer" id="patrolBoatContainer">
<div class="ship" id="patrolBoat"></div>
</div>`;

game.showGameInfo = function() {

    $('#gameInfo').empty();
    $('#gameInfo').append(`<div class="playerContainer">
        <h3>Player 1</h3>
        <div id="player1Box"></div>
    </div>
    <div class="playerContainer">
        <h3>Player 2</h3>
        <div id="player2Box"></div>
    </div>
    <div id="textBox">
    </div>
    `);
}

game.checkDestroyed = function(currentPlayer, currentOpponent, ship) {

    if (game[`player${currentPlayer}ShipLocations`].hits[ship].length === game.ships[ship]) {

        if (game[`player${currentPlayer}ShipLocations`].shipsSunk.length === undefined) {

            $('#textBox').append(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship}!</p>`);
            game[`player${currentPlayer}ShipLocations`].shipsSunk = [ship];
        }
        else if (game[`player${currentPlayer}ShipLocations`].shipsSunk.length === 4) {

            $('#textBox').append(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship} and won the game!</p>`);
        }
        else {

            $('#textBox').append(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship}!</p>`);
            game[`player${currentPlayer}ShipLocations`].shipsSunk.push(ship);
        };

        if (currentPlayer === '2') {

            game.currentShip = null;
        };
    };
}

game.setupShips = function(currentPlayer, currentOpponent) {

    $('#gameArea .gridBox').empty();

    while ($('#textBox').children().length > 7) {

        $('#textBox').children()[0].remove();
    };

    Object.keys(game.ships).forEach(function(ship) {

        $('#gameArea .gridBox').removeClass(ship);

        if (game[`player${currentPlayer}ShipLocations`].shipsSunk.includes(ship)) {

            game[`player${currentPlayer}ShipLocations`].hits[ship].forEach(function(hit) {

                $(`#box${hit.toString()}`).addClass(ship);
            });
        };
        
        game[`player${currentPlayer}ShipLocations`].hits[ship].forEach(function(hit) {

            $(`#box${hit.toString()}`).append(`<i class="fas fa-bahai"></i>`);
        });
    });

    game[`player${currentPlayer}ShipLocations`].misses.forEach(function(miss) {

        $(`#box${miss.toString()}`).append(`<i class="fas fa-times"></i>`);
    });

    $(`#player${currentOpponent}Box`).css('border', 'none');
    $(`#player${currentPlayer}Box`).css('border', '3px solid white');
}

game.checkEmpty = function(boxIndex) {

    const box = $(`#box${boxIndex.toString()}`);
    
    if (box.children().length > 0 || box.parent()[0] === undefined || box.parent()[0].id !== 'gameArea') {
        return false;
    }
    else {
        return true;
    };
}

game.mostSpace = function(startBox, directions) {

    const counter = {
        up: 0,
        left: 0,
        right: 0,
        down: 0
    };
    let highestCounter = 0;
    let highestDirection;

    for (i = 1; i < 10; i++) {

        directions.forEach(function(direction) {

            switch (direction) {
                case 'up':
                    game.checkEmpty(startBox + (i * UP)) ? counter.up++ : directions.splice(directions.indexOf('up'), 1, null);
                    break;
                case 'down':
                    game.checkEmpty(startBox + (i * DOWN)) ? counter.down++ : directions.splice(directions.indexOf('down'), 1, null);
                    break;
                case 'left':
                    game.checkEmpty(startBox + (i * LEFT)) ? counter.left++ : directions.splice(directions.indexOf('left'), 1, null);
                    break;
                case 'right':
                    game.checkEmpty(startBox + (i * RIGHT)) ? counter.right++ : directions.splice(directions.indexOf('right'), 1, null);
            };
        });
    };

    Object.keys(counter).forEach(function(directionCounter) {

        if (counter[directionCounter] > highestCounter) {

            highestCounter = counter[directionCounter];
            highestDirection = directionCounter
        };
    });

    game.directions = ['up', 'down', 'left', 'right'];

    return [highestDirection, highestCounter];
}

game.doHit = function(box, direction) {

    let target;
    let hit = false;

    switch (direction) {
        case 'up':
            target = box + UP;
            break;
        case 'down':
            target = box + DOWN;
            break;
        case 'left':
            target = box + LEFT;
            break;
        case 'right':
            target = box + RIGHT;
            break;
        case 'noDirection':
            target = box;
    };
    
    const targetId = `box${target.toString()}`;
    
    setTimeout(function() {

        Object.keys(game.ships).forEach(function(ship) {

            if (game.player1ShipLocations[ship].shipMap.includes(target)) {

                hit = true;
                $(`#${targetId}`).append(`<i class="fas fa-bahai"></i>`);
                game.player2ShipLocations.hits[ship].push(target);
                game.currentShip = ship;

                $('#textBox').append(`<p>Player 2 has hit Player 1's ${ship} ${game.player2ShipLocations.hits[ship].length} time(s).</p>`);
                game.checkDestroyed('2', '1', ship);
            };
        });
    
        if (hit === false) {

            $(`#${targetId}`).append(`<i class="fas fa-times"></i>`);
            game.player2ShipLocations.misses.push(target);
        };
    }, 1000);
}


game.bestTarget = function(lastDirection) {

    let directionArray;
    let validDirection;
    let chosenDirection;
    let oppositeDirection;
    const startingBox = game.player2ShipLocations.hits[game.currentShip][game.player2ShipLocations.hits[game.currentShip].length - 1];

    if (game.player2ShipLocations.hits[game.currentShip].length === 1) {

        directionArray = game.mostSpace(startingBox, game.directions);
        game.doHit(startingBox, directionArray[0]);
        return directionArray[0];
    }
    else if (lastDirection){

        switch (lastDirection) {
            case 'up':
                validDirection = game.checkEmpty(startingBox + UP);
                chosenDirection = 'up';
                oppositeDirection = 'down';
                break;
            case 'down':
                validDirection = game.checkEmpty(startingBox + DOWN);
                chosenDirection = 'down';
                oppositeDirection = 'up';
                break;
            case 'left':
                validDirection = game.checkEmpty(startingBox + LEFT);
                chosenDirection = 'left';
                oppositeDirection = 'right';
                break;
            case 'right':
                validDirection = game.checkEmpty(startingBox + RIGHT);
                chosenDirection = 'right';
                oppositeDirection = 'left';
        };

        if (validDirection) {
            game.doHit(startingBox, chosenDirection);
            return chosenDirection;
        }
        else {
            game.doHit(game.player2ShipLocations.hits[game.currentShip][0], oppositeDirection);
            return oppositeDirection;
        };
    };
}

game.randomBox = function() {

    return Math.ceil(Math.random() * 120);
}

game.randomShot = function() {

    let directionArray;
    const shot = game.randomBox();
    let biggestShip = 0;

    if (game.checkEmpty(shot)) {

        directionArray = game.mostSpace(shot, game.directions);

        Object.keys(game.ships).forEach(function(ship) {
            if (!(game.player2ShipLocations.shipsSunk.includes(ship)) && game.ships[ship] > biggestShip) {
                biggestShip = game.ships[ship];
            };
        });

        if (directionArray[1] < biggestShip) {
            game.randomShot();
        }
        else {
            game.doHit(shot, 'noDirection');
        };
    }
    else {

        game.randomShot();
    };
}

game.computerTurn = function() {

    game.setupShips('2', '1');

    if (game.currentShip === null || game.player2ShipLocations.shipsSunk.includes(game.currentShip)) {

        game.currentDirection = null;

        Object.keys(game.ships).forEach(function(ship) {

            if (game.player2ShipLocations.hits[ship].length !== 0 && game.player2ShipLocations.hits[ship].length < game.ships[ship]) {

                game.currentShip = ship;
            };
        });
    };
    
    if (game.currentShip && !(game.player2ShipLocations.shipsSunk.includes(game.currentShip))) {

        game.currentDirection = game.bestTarget(game.currentDirection);
    };

    if (!game.currentShip) {
        
        game.randomShot();
    };
}

game.play = function() {

    let currentPlayer = '1';
    let currentOpponent = '2';
    let canIClick = true;

    game.player1ShipLocations.misses = [];
    game.player2ShipLocations.misses = [];
    game.player1ShipLocations.shipsSunk = [];
    game.player2ShipLocations.shipsSunk = [];
    game.player1ShipLocations.hits = {
        carrier: [],
        battleship: [],
        destroyer: [],
        submarine: [],
        patrolBoat: []
    };
    game.player2ShipLocations.hits = {
        carrier: [],
        battleship: [],
        destroyer: [],
        submarine: [],
        patrolBoat: []
    };

    $('#footerInfo').empty();
    game.showGameInfo();
    $('#textBox').append(`<p>The game has begun!</p>`);
    game.setupShips(currentPlayer, currentOpponent);


    $('#gameArea .gridBox').on('click', function() {

        if (canIClick === true) {

            canIClick = false;
            const $thisBox = $(this);
            const boxNumber = parseInt(this.id.slice(3));
            let dumb = false;
            let hit = false;
    
            Object.keys(game.ships).forEach(function(ship) {

                if (game[`player${currentOpponent}ShipLocations`][ship].shipMap.includes(boxNumber)) {

                    hit = true;
                    $thisBox.append(`<i class="fas fa-bahai"></i>`);
                    game[`player${currentPlayer}ShipLocations`].hits[ship].push(boxNumber);

                    $('#textBox').append(`<p>Player ${currentPlayer} has hit Player ${currentOpponent}'s ${ship} ${game[`player${currentPlayer}ShipLocations`].hits[ship].length} time(s)</p>`);
                    game.checkDestroyed(currentPlayer, currentOpponent, ship);
                };
            });
    
            if (hit === false && game[`player${currentPlayer}ShipLocations`].misses.includes(boxNumber)) {

                dumb = true;
            }
            else if (hit === false) {

                $thisBox.append(`<i class="fas fa-times"></i>`);
                game[`player${currentPlayer}ShipLocations`].misses.push(boxNumber);
            };

            if (dumb === false) {
    
                setTimeout(function() {

                    if (game.players === 2) {
    
                        if (currentPlayer === '1') {

                            currentPlayer = '2';
                            currentOpponent = '1';
                        }
                        else {

                            currentPlayer = '1';
                            currentOpponent = '2';
                        };
                        
                        game.setupShips(currentPlayer, currentOpponent);
                        canIClick = true;
                    };
    
                    if (game.players === 1) {

                        game.computerTurn();
    
                        setTimeout(function() {

                            game.setupShips(currentPlayer, currentOpponent);
                            canIClick = true;
                        }, 2000);
                    };
                }, 1000);
            };
        };
    });
}

game.resize = function($box) {

    let width = $box.outerWidth();
    let height = $box.outerHeight();
    $box.css('left', `calc(50% - ${width / 2}px)`).css('top', `calc(50% - ${height / 2}px)`);

    $(window).on('resize', function() {

        width = $box.outerWidth();
        height = $box.outerHeight();
        $box.css('left', `calc(50% - ${width / 2}px)`).css('top', `calc(50% - ${height / 2}px)`);
    });
}

game.checkShips = function(playerLocationsString) {

    let check = true;
    game[playerLocationsString].shipMap = [];
    
    Object.keys(game.ships).forEach(function(ship) {

        if (game[playerLocationsString][ship] !== undefined) {

            game[playerLocationsString].shipMap = game[playerLocationsString].shipMap.concat(game[playerLocationsString][ship].shipMap);
        };
    });

    const sortedLocationArray = game[playerLocationsString].shipMap.sort();
    let previous;

    sortedLocationArray.forEach(function(e) {

        if (e === previous || game.unacceptableLocations.includes(e)) {

            check = false;
        };

        previous = e;
    });

    return check;
}

game.mapShips = function(playerLocationsString) {

    Object.keys(game.ships).forEach(function(ship) {
        
        if (game[playerLocationsString][ship] !== undefined) {

            game[playerLocationsString][ship].shipMap = [];            
            const locationIndex = game[playerLocationsString][ship].location;
            const anchor = locationIndex - Math.floor(game.ships[ship] / 2);
            
            if (game[playerLocationsString][ship].rotation === 0) {
                
                for (i = 0; i < game.ships[ship]; i++) {

                    game[playerLocationsString][ship].shipMap.push(anchor + i);
                };
            };
            
            if (game[playerLocationsString][ship].rotation === 1) {
                
                for (i = 0; i < game.ships[ship]; i++) {

                    game[playerLocationsString][ship].shipMap.push(anchor + (i * 12));
                };
            };
        };
    });

    if (game.checkShips(playerLocationsString) === false) {

        return false;
    }
    else {

        return true;
    };
}

game.placeComputerShips = function() {

    Object.keys(game.ships).forEach(function randomShipLocation(e) {

        game.player2ShipLocations[e] = {};
        game.player2ShipLocations[e].rotation = Math.round(Math.random());

        if (game.player2ShipLocations[e].rotation === 0) {

            game.player2ShipLocations[e].location = (Math.floor(Math.random() * 10)) * 12 + ((Math.ceil(Math.random() * (10 - (2 * Math.floor((game.ships[e] / 2)))))) + Math.floor((game.ships[e] / 2)));
        };

        if (game.player2ShipLocations[e].rotation === 1) {

            game.player2ShipLocations[e].location = ((Math.floor(Math.random() * (10 - (game.ships[e] - 1))))) * 12 + Math.ceil(Math.random() * 10) + 2;
        };

        if (game.mapShips('player2ShipLocations') === false) {
            randomShipLocation(e);
        };
    });
}

game.displayShips = function() {

    $('#gameInfo').empty();
    $('#footerInfo').empty();
    $('#gameInfo').append(game.shipHTML);

    Object.keys(game.ships).forEach(function(ship) {

        $(`#${ship}Container`).append(`<h3>${ship}</h3>`);
        
        for (i = 0; i < game.ships[ship]; i++) {

            $(`#${ship}`).append(`<div class="gridBox"></div>`);
        };
    });
}

game.placeShips = function(player) {

    let currentShip;
    let shipLocations;

    if (player === '1') {

        shipLocations = 'player1ShipLocations';
    };

    if (player === '2') {

        shipLocations = 'player2ShipLocations';
    };

    $('#gameArea .gridBox').draggable({

        disabled: true
    });

    $('#extraGrid .gridBox').draggable({

        disabled: true
    });

    $('.ship').draggable({

        snap: $('.gridBox'),
        snapTolerance: ($(document).height() / 728) * 35
    });
    
    $('#gameArea .gridBox').droppable();
    $('#extraGrid .gridBox').droppable();

    $('.ship').on('mouseover', function(e) {

        currentShip = e.target.parentElement.id;
        $currentShipObject = $(e.target.parentElement);

        if (game[shipLocations][currentShip] === undefined) {

            game[shipLocations][currentShip] = {};
            game[shipLocations][currentShip].rotation = 0;
            game[shipLocations][currentShip].currentTranslation = [0, 0];
        };
    });

    $('.ship').on('mousedown', function() {

        $(this).children().css('background-color', '#274156');
    });

    $('.ship').on('mouseup', function() {

        if (game[shipLocations][currentShip].location !== undefined) {

            $(this).children().css('background-color', '#1C6E8C');
        };
    });

    $('.gridBox').on('drop', function(e) {

        game[shipLocations][currentShip].location = parseInt(e.target.id.slice(3));

        if (game[shipLocations][currentShip].location !== undefined) {

            $currentShipObject.children().css('background-color', '#1C6E8C');
        };
    });

    $(document).on('keydown', function(e) {

        if (e.keyCode === 69 || e.keyCode === 81) {

            game[shipLocations][currentShip].rotation++;
            $currentShipObject.css({'transform' : `rotate(${90 * (game[shipLocations][currentShip].rotation % 2)}deg)`});
        };
        if (game[shipLocations][currentShip] !== undefined && game[shipLocations][currentShip].location !== undefined) {

            switch(e.keyCode) {
                case 87:
                    game[shipLocations][currentShip].currentTranslation[1] = game[shipLocations][currentShip].currentTranslation[1] - 1;  
                    $currentShipObject.css({'transform' : `translate(calc(${game[shipLocations][currentShip].currentTranslation[0] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[0] * 0.7}%), calc(${game[shipLocations][currentShip].currentTranslation[1] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[1] * 3}%))`});
                    game[shipLocations][currentShip].location = game[shipLocations][currentShip].location + UP;
                    break;
                case 83:
                    game[shipLocations][currentShip].currentTranslation[1] = game[shipLocations][currentShip].currentTranslation[1] + 1;  
                    $currentShipObject.css({'transform' : `translate(calc(${game[shipLocations][currentShip].currentTranslation[0] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[0] * 0.7}%), calc(${game[shipLocations][currentShip].currentTranslation[1] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[1] * 3}%))`});
                    game[shipLocations][currentShip].location = game[shipLocations][currentShip].location + DOWN;
                    break;
                case 65:
                    game[shipLocations][currentShip].currentTranslation[0] = game[shipLocations][currentShip].currentTranslation[0] - 1;  
                    $currentShipObject.css({'transform' : `translate(calc(${game[shipLocations][currentShip].currentTranslation[0] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[0] * 0.7}%), calc(${game[shipLocations][currentShip].currentTranslation[1] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[1] * 3}%))`});
                    game[shipLocations][currentShip].location = game[shipLocations][currentShip].location + LEFT;
                    break;
                case 68:
                    game[shipLocations][currentShip].currentTranslation[0] = game[shipLocations][currentShip].currentTranslation[0] + 1;  
                    $currentShipObject.css({'transform' : `translate(calc(${game[shipLocations][currentShip].currentTranslation[0] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[0] * 0.7}%), calc(${game[shipLocations][currentShip].currentTranslation[1] * 8}vh + ${game[shipLocations][currentShip].currentTranslation[1] * 3}%))`});
                    game[shipLocations][currentShip].location = game[shipLocations][currentShip].location + RIGHT;
            };
        };
    });

    $('#footerInfo').append(`<button id="doneButton">Done</button>`);

    if (game.players === 2) {

        $('#footerInfo').append(`<h3>Player ${player} is placing their ships</h3>`);
    };

    if (game.players === 1) {

        $('#footerInfo').append(`Place your ships</h3>`);
    }


    $('#doneButton').on('click', function() {

        if (game.players === 1) {

            if (game.mapShips(shipLocations) === false) {

                alert('Ships cannot overlap or hang off the game grid, try again!');
                game.displayShips();
                game.placeShips('1');
            }
            else {

                game.placeComputerShips();
                game.play();
            };
        };

        if (game.players === 2) {

            if (player === '1') {

                game.displayShips();
                
                if (game.mapShips(shipLocations) === false) {

                    alert('Ships cannot overlap or hang off the game grid, try again!');
                    game.placeShips('1');
                };
                
                if (game.mapShips(shipLocations) === true) {

                    game.placeShips('2');
                };
            };

            if (player === '2') {

                if (game.mapShips(shipLocations) === false) {

                    alert('Ships cannot overlap or hang off the game grid, try again!');
                    game.placeShips('2');
                };

                game.play();
            };
        }; 
    });
}

game.welcome = function() {

    $('html').append(game.welcomeHTML);
    const $welcomeBox = $('#welcome');
    game.resize($welcomeBox);

    $('button').on('click', function(e) {

        const choice = e.target.id;
        
        if (choice === 'computerButton') {

            game.players = 1;
        };

        if (choice === 'playerButton') {

            game.players = 2;
        };

        $welcomeBox.hide();
        game.placeShips('1');
    });
}

game.init = function() {

    game.displayShips();
    game.welcome();
}


$(function() {
    
    game.init();
});