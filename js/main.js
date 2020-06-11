const game = {};

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


// changes the contents of the gameInfo div when game is started 

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


// checks if a hit ship/all ships is/are completely destroyed and informs player(s) of result 

game.checkDestroyed = function(currentPlayer, currentOpponent, ship) {
    if (game[`player${currentPlayer}ShipLocations`].hits[ship].length === game.ships[ship]) {
        if (game[`player${currentPlayer}ShipLocations`].shipsSunk.length === undefined) {
            $('#textBox').prepend(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship}!</p>`);
            game[`player${currentPlayer}ShipLocations`].shipsSunk = [ship];
        }
        else if (game[`player${currentPlayer}ShipLocations`].shipsSunk.length === 4) {
            game.done = true;
            $('#textBox').prepend(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship} and won the game!</p>`);
            $('.gridBox').unbind();
            $('#footerInfo').append(`
                <h3>Player ${currentPlayer} wins! Play again?</h3>
                <button id="playAgainButton">Play</button>
            `);

            $('#playAgainButton').on('click', function() {
                game.init();
            });
        }
        else {
            $('#textBox').prepend(`<p>Player ${currentPlayer} has sunk Player ${currentOpponent}'s ${ship}!</p>`);
            game[`player${currentPlayer}ShipLocations`].shipsSunk.push(ship);
        };

        if (currentPlayer === '2') {
            game.currentShip = null;
        };
    };
}


// displays hits/misses/destroyed ships on change of turn

game.setupShips = function(currentPlayer, currentOpponent) {
    $('#gameArea .gridBox').empty();

    while ($('#textBox').children().length > 7) {
        $('#textBox').children()[7].remove();
    };

    Object.keys(game.ships).forEach(function(ship) {
        $('#gameArea .gridBox').removeClass(ship);

        if (game[`player${currentPlayer}ShipLocations`].shipsSunk.includes(ship)) {
            game[`player${currentPlayer}ShipLocations`].hits[ship].forEach(function(hit) {
                $(`#r${hit[0]}c${hit[1]}`).addClass(ship);
            });
        };
        
        game[`player${currentPlayer}ShipLocations`].hits[ship].forEach(function(hit) {
            $(`#r${hit[0]}c${hit[1]}`).append(`<i class="fas fa-bahai"></i>`);
        });
    });

    game[`player${currentPlayer}ShipLocations`].misses.forEach(function(miss) {
        $(`#r${miss[0]}c${miss[1]}`).append(`<i class="fas fa-times"></i>`);
    });

    $(`#player${currentOpponent}Box`).css('border', 'none');
    $(`#player${currentPlayer}Box`).css('border', '3px solid white');
}


// checks if a given square is empty/can be targeted

game.checkEmpty = function(boxIndex) {

    const $box = $(`#r${boxIndex[0]}c${boxIndex[1]}`);
    
    if ($box.children().length > 0 || $box.parent()[0] === undefined || $box.parent()[0].id !== 'gameArea') {
        return false;
    }
    else {
        return true;
    };
}


// looks for the direction with the most space after a hit (therefore most likely to contain rest of ship)

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
                    game.checkEmpty([startBox[0] - i, startBox[1]]) ? counter.up++ : directions.splice(directions.indexOf('up'), 1, null);
                    break;
                case 'down':
                    game.checkEmpty([startBox[0] + i, startBox[1]]) ? counter.down++ : directions.splice(directions.indexOf('down'), 1, null);
                    break;
                case 'left':
                    game.checkEmpty([startBox[0], startBox[1] - i]) ? counter.left++ : directions.splice(directions.indexOf('left'), 1, null);
                    break;
                case 'right':
                    game.checkEmpty([startBox[0], startBox[1] + i]) ? counter.right++ : directions.splice(directions.indexOf('right'), 1, null);
            };
        });
    };

    Object.keys(counter).forEach(function(directionCounter) {
        if (counter[directionCounter] > highestCounter) {
            highestCounter = counter[directionCounter];
            highestDirection = directionCounter;
        };
    });

    game.directions = ['up', 'down', 'left', 'right'];
    return [highestDirection, highestCounter];
}


// Executes a shot and determines result (hit, miss, or destroyed ship)

game.doHit = function(box, direction) {
    let target;
    let hit = false;

    switch (direction) {
        case 'up':
            target = [box[0] - 1, box[1]];
            break;
        case 'down':
            target = [box[0] + 1, box[1]];
            break;
        case 'left':
            target = [box[0], box[1] - 1];
            break;
        case 'right':
            target = [box[0], box[1] + 1];
            break;
        case 'noDirection':
            target = box;
    };
    
    const targetId = `r${target[0]}c${target[1]}`;
    
    setTimeout(function() {
        Object.keys(game.ships).forEach(function(ship) {
            let isHit = game.player1ShipLocations[ship].shipMap.find((el) => {
                return (el[0] === target[0] && el[1] === target[1]);
            });

            if (isHit) {
                hit = true;
                $(`#${targetId}`).append(`<i class="fas fa-bahai"></i>`);
                game.player2ShipLocations.hits[ship].push(target);
                game.currentShip = ship;

                $('#textBox').prepend(`<p>Player 2 has hit Player 1's ${ship} ${game.player2ShipLocations.hits[ship].length} time(s).</p>`);
                game.checkDestroyed('2', '1', ship);
            };
        });
    
        if (!hit) {
            $(`#${targetId}`).append(`<i class="fas fa-times"></i>`);
            game.player2ShipLocations.misses.push(target);
        };
    }, 1000);
}


// AI logic if a ship is hit 

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
                validDirection = game.checkEmpty([startingBox[0] - 1, startingBox[1]]);
                chosenDirection = 'up';
                oppositeDirection = 'down';
                break;
            case 'down':
                validDirection = game.checkEmpty([startingBox[0] + 1, startingBox[1]]);
                chosenDirection = 'down';
                oppositeDirection = 'up';
                break;
            case 'left':
                validDirection = game.checkEmpty([startingBox[0], startingBox[1] - 1]);
                chosenDirection = 'left';
                oppositeDirection = 'right';
                break;
            case 'right':
                validDirection = game.checkEmpty([startingBox[0], startingBox[1] + 1]);
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


// returns a random square

game.randomBox = function() {
    return [Math.ceil(Math.random() * 10), Math.ceil(Math.random() * 10)];
}


// finds an empty square to target using the above random function and further above checkEmpty function

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


// AI top-level decision-making

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


// initializes game + creates necessary event listeners

game.play = function() {
    let currentPlayer = '1';
    let currentOpponent = '2';
    let canIClick = true;
    game.done = false;

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
    $('#textBox').prepend(`<p>The game has begun!</p>`);
    game.setupShips(currentPlayer, currentOpponent);

    $('#gameArea .gridBox').on('click', function() {
        if (canIClick === true) {
            canIClick = false;

            const $thisBox = $(this);
            const boxCoords = this.id.slice(1).split('c');
            const boxNumber = [parseInt(boxCoords[0]), parseInt(boxCoords[1])];
            let dumb = false;
            let isHit = false;
            let alreadyHit;
    
            Object.keys(game.ships).forEach(function(ship) {
                alreadyHit = game[`player${currentPlayer}ShipLocations`].hits[ship].find((hit) => {
                    return (hit[0] === boxNumber[0] && hit[1] === boxNumber[1]);
                });

                if (alreadyHit !== undefined) {
                    dumb = true;
                    canIClick = true;
                };

                let hit = game[`player${currentOpponent}ShipLocations`][ship].shipMap.find((el) => {
                    return (alreadyHit === undefined && el[0] === boxNumber[0] && el[1] === boxNumber[1]);
                });

                if (hit) {
                    isHit = true;
                    $thisBox.append(`<i class="fas fa-bahai"></i>`);
                    game[`player${currentPlayer}ShipLocations`].hits[ship].push(boxNumber);

                    $('#textBox').prepend(`<p>Player ${currentPlayer} has hit Player ${currentOpponent}'s ${ship} ${game[`player${currentPlayer}ShipLocations`].hits[ship].length} time(s)</p>`);
                    game.checkDestroyed(currentPlayer, currentOpponent, ship);
                };
            });
    
            if (!isHit && game[`player${currentPlayer}ShipLocations`].misses.find((el) => {
                return (el[0] === boxNumber[0] && el[1] === boxNumber[1]);
            })) {
                dumb = true;
                canIClick = true;
            }
            else if (!isHit && dumb === false) {
                $thisBox.append(`<i class="fas fa-times"></i>`);
                game[`player${currentPlayer}ShipLocations`].misses.push(boxNumber);
            };

            if (dumb === false && game.done === false) {
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

                        if (!game.done) {
                            setTimeout(function() {
                                game.setupShips(currentPlayer, currentOpponent);
                                canIClick = true;
                            }, 2000);
                        };
                    };
                }, 1000);
            };
        };
    });
}


// keeps the element centered if the window is resized

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


// makes sure the placed ships are not overlapping each other or the edge of the game area

game.checkShips = function(playerLocationsString, computerBoolean = false) {
    let check = true;
    game[playerLocationsString].shipMap = [];
    
    Object.keys(game.ships).forEach(function(ship) {
        if (game[playerLocationsString][ship] !== undefined) {
            game[playerLocationsString].shipMap = game[playerLocationsString].shipMap.concat(game[playerLocationsString][ship].shipMap);
        };
    });
    
    const sortedLocationArray = game[playerLocationsString].shipMap.sort();
    let previous;

    if (computerBoolean === true && sortedLocationArray.length !== 17) {
        check = false;
    };

    sortedLocationArray.forEach(function(el) {
        if (el[0] > 10 || el[1] > 10) {
            check = false;
        };

        if (previous && el[0] === previous[0]) {
            if (el[1] === previous[1]) {
                check = false;
            };
        };
        previous = el;
    });
    return check;
}


// creates an array of all occupied squares for each ship

game.mapShips = function(playerLocationsString) {
    Object.keys(game.ships).forEach(function(ship) {
        if (game[playerLocationsString][ship] !== undefined) {
            game[playerLocationsString][ship].shipMap = [];            

            if (game[playerLocationsString][ship].rotation % 2 === 0) {    
                for (i = 0; i < game.ships[ship]; i++) {
                    game[playerLocationsString][ship].shipMap.push([parseInt(game[playerLocationsString][ship].location[0]), parseInt(game[playerLocationsString][ship].location[1]) + i]);
                };
            };
            
            if (game[playerLocationsString][ship].rotation % 2 === 1) {
                for (i = 0; i < game.ships[ship]; i++) {
                    game[playerLocationsString][ship].shipMap.push([parseInt(game[playerLocationsString][ship].location[0]) + i, parseInt(game[playerLocationsString][ship].location[1])]);
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


// places the computer's ships randomly

game.placeComputerShips = function() {

    Object.keys(game.ships).forEach(function randomShipLocation(ship) {
        game.player2ShipLocations[ship] = {};
        game.player2ShipLocations[ship].rotation = Math.round(Math.random());

        if (game.player2ShipLocations[ship].rotation === 0) {
            game.player2ShipLocations[ship].location = [Math.ceil(Math.random() * 10), Math.ceil(Math.random() * (10 - (game.ships[ship] - 1)))];
        };

        if (game.player2ShipLocations[ship].rotation === 1) {
            game.player2ShipLocations[ship].location = [Math.ceil(Math.random() * (10 - (game.ships[ship] - 1))), Math.ceil(Math.random() * 10)];
        };

        if (game.mapShips('player2ShipLocations', true) === false) {
            randomShipLocation(ship);
        };
    });
}


// generates the ship HTML

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


// repositions ships when using WASD movement

game.translateShip = function(ship, newLocation) {
    const shipObject = $(`#${ship}`);

    shipObject.position({
        my: "left",
        at: "left",
        of: `#r${newLocation[0]}c${newLocation[1]}`,
    });
}


// creates event listeners to allow player to place their ships, make them draggable, and record their locations

game.placeShips = function(player) {
    let currentShip;
    let shipLocations;
    const docHeight = $(document).height();

    if (player === '1') {
        shipLocations = 'player1ShipLocations';
    };

    if (player === '2') {
        shipLocations = 'player2ShipLocations';
    };
    
    $('#gameArea .gridBox').draggable({
        disabled: true
    }).droppable({
        drop: function() {
            if (game[shipLocations][currentShip].location !== undefined) {
                $currentShipObject.children().css('background-color', '#1C6E8C');
            };
        },
        tolerance: 'pointer',
        over: function(e) {
            game[shipLocations][currentShip].location = e.target.id.slice(1).split('c');
        }
    });

    $('.ship').draggable({
        snap: $('.gridBox'),
        snapTolerance: docHeight / 25,
        revert: 'invalid',
        cursorAt: { left: docHeight / 25, top: docHeight / 25 }
    });

    $('.ship').on('mouseover', function(e) {
        currentShip = e.target.parentElement.id;
        $currentShipObject = $(e.target.parentElement);

        if (game[shipLocations][currentShip] === undefined) {
            game[shipLocations][currentShip] = {};
            game[shipLocations][currentShip].rotation = 0;
        };
    });

    $('.ship').on('mousedown', function(e) {
        $(this).children().css('background-color', '#274156');
    });

    $('.ship').on('mouseup', function() {
        if (game[shipLocations][currentShip].location !== undefined) {
            $(this).children().css('background-color', '#1C6E8C');
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
                    if (game[shipLocations][currentShip].location[0] > 1) {
                        game[shipLocations][currentShip].location[0]--;
                        game.translateShip(currentShip, game[shipLocations][currentShip].location);
                    }; 
                    break;
                case 83:
                    if (game[shipLocations][currentShip].location[0] < 10) {
                        game[shipLocations][currentShip].location[0]++;
                        game.translateShip(currentShip, game[shipLocations][currentShip].location);
                    };
                    break;
                case 65:
                    if (game[shipLocations][currentShip].location[1] > 1) {
                        game[shipLocations][currentShip].location[1]--;
                        game.translateShip(currentShip, game[shipLocations][currentShip].location);
                    };
                    break;
                case 68:
                    if (game[shipLocations][currentShip].location[1] < 10) {
                        game[shipLocations][currentShip].location[1]++;
                        game.translateShip(currentShip, game[shipLocations][currentShip].location);
                    };
            };
        };
    });

    $('#footerInfo').append(`<button id="doneButton">Done</button>`);

    if (game.players === 2) {
        $('#footerInfo').append(`<h3>Player ${player} is placing their ships</h3>`);
    };

    if (game.players === 1) {
        $('#footerInfo').append(`Place your ships</h3>`);
    };


    $('#doneButton').on('click', function() {
        if (game.players === 1) {
            if (game.mapShips(shipLocations) === false) {
                alert('Ships cannot overlap or hang off the game grid and must all be placed, try again!');
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
                    alert('Ships cannot overlap or hang off the game grid and must all be placed, try again!');
                    game.placeShips('1');
                };
                
                if (game.mapShips(shipLocations) === true) {
                    game.placeShips('2');
                };
            };

            if (player === '2') {
                if (game.mapShips(shipLocations) === false) {
                    alert('Ships cannot overlap or hang off the game grid and must all be placed, try again!');
                    game.placeShips('2');
                };

                game.play();
            };
        }; 
    });
}


// creates welcome/play options div

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

        // $welcomeBox.hide();
        $welcomeBox.remove();
        game.placeShips('1');
    });
}


// init function

game.init = function() {
    game.player1ShipLocations = {};
    game.player2ShipLocations = {};

    $('#gameArea .gridBox').empty();
    game.displayShips();
    game.welcome();
}


// document ready

$(function() {
    game.init();
});