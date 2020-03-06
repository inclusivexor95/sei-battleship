# Matt's Project 1 - Battleship

### Background:

Battleship is a strategy type guessing game for two players. It is played on ruled grids (paper or board) on which each player's fleet of ships (including battleships) are marked. The locations of the fleets are concealed from the other player. Players alternate turns calling "shots" at the other player's ships, and the objective of the game is to destroy the opposing player's fleet.

Battleship is known worldwide as a pencil and paper game which dates from World War I. It was published by various companies as a pad-and-pencil game in the 1930s, and was released as a plastic board game by Milton Bradley in 1967. The game has spawned electronic versions, video games, smart device apps and a film. 

### Screenshots:

[Screenshot 1](https://git.generalassemb.ly/inclusivexor95/sei-3/blob/master/projects/project-1/battleship/screenshots/battleshipScreenshot1.png)

[Screenshot 2](https://git.generalassemb.ly/inclusivexor95/sei-3/blob/master/projects/project-1/battleship/screenshots/battleshipScreenshot2.png)

### Technologies Used:

* HTML

* CSS

* Javascript (with JQuery and JQuery UI libraries)

### Getting Started:

[Game link here](https://inclusivexor95.github.io/sei-battleship/)

To play this game, you must first select an opponent (either a second player or the computer AI) by clicking one of the two buttons. Next, click and drag each ship onto the game board. If you are playing with two players, make sure the second player is not looking! Pressing the W, A, S, and D keys shifts the current ship by one square (up, left, down, and right respectively), and pressing the Q and E keys rotates the current ship. Ships cannot hang off of the grid, and cannot overlap each other. When you have finished placing the ships, click the 'done' button at the bottom of the screen. 

If you are playing with two players, the first player should now look away/turn around while the second player places their own ships (if you are playing against the computer this step is skipped).

Now, each player will take turns clicking on a square of their choice. If one of their opponents ships occupy their chosen square, an explosion icon will appear within the square. Otherwise, an 'x' will appear. Either way, each player can only choose one square per turn, and then it switches to the other player(or the computer, if applicable)'s turn. When all of the squares occupied by a ship are hit, the ship is destroyed. The first player to destroy all 5 of their opponents ships wins the game.

### Next Steps:

* Realistic ship/hit/miss icons

* More Advanced AI

* Overall UI tweaks/improvements