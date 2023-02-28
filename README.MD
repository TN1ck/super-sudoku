# Super Sudoku

Currently hosted at [https://sudoku.tn1ck.com](https://sudoku.tn1ck.com).

![Screenshot 2022-09-05 at 19 15 08](https://user-images.githubusercontent.com/2116347/188494040-0a7b4512-c5b8-4073-bc4a-b78e469ad90e.png)


This project aims to be a sudoku app with everything included. An open source sudoku that is on par with all commercial applications. Why? Because my Grandma wanted to play a Sudoku once and I didn't like all the available offers. This has changed since then, but having an open source version will hopefully help people in the future.


## Setup

You need nodejs to run this project. Check [here](https://nodejs.org/en/download/package-manager/) on how to install nodejs if you haven't done it yet. This project was tested with version 16.

If you have node installed, execute in a terminal:

```
npm install
npm start
```

The app should be available on `https://127.0.0.1:3000`.

To build the project, execute `npm run build`, the generated files are in the `dist` directory.

## Features include:

- Solving of sudokus
- Generation of sudokus in different difficulties
- Responsive, works on desktop as well as mobile
- Providing hints to actually provide a real value over paper based sudokus
- Shortcuts
    - Arrow keys: Move around the board
    - Number keys: Write a note or set the sudoku number
    - Backspace: Delete a number
    - Escape: Pause/unpause the game
    - H: Hint
    - N: Enter/exit note mode
- Save the users progress
- Options to disable helper highlights like wrong entry or conflict

## Solve & Generate Sudokus

A generator was build to create an infinite amount of sudokus for every difficulty Level.
The generator is mostly based on the paper "Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems".
Currently I include a few hundred sudokus with this app, in the future it would be nice if a user could generate more if he would like to / having an interface to create new sudokus.

There are two scripts included in this project:

* `generate_sudokus.ts` - given a difficulty level and number of sudokus it will generate these and append the results to the `sudokus.txt` file
* `read_sudokus.ts` - reads the `sudokus.txt` file and creates a `sudokus.json` which is used in the application itself. It adds some more data and changes the datastructure. The contents need then to be placed in `src/assets/sudokus.ts`. I also format the file with prettier, to make it prettier.

## Contribution

Every contribution is welcome! Simply fork the project and create a PR. You can also create an issue and ask for a feature.
