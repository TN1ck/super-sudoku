# Super Sudoku

Currently hosted at [https://supersudoku.netlify.com](https://supersudoku.netlify.com). Still WIP and a domain will be bought if it's finished.

This project aims to be a sudoku app with everything included. An open source sudoku that is on par with all commercial applications. Why? Because my Grandma wanted to play a Sudoku once and I didn't like all the available offers. This has changed since then, but having an open source version will hopefully help people in the future.

### Features Done:

- [x] Solving of sudokus
- [x] Generation of sudokus in different difficulties
- [x] Creating a responsive web-app that works on mobile as good as on desktop
- [x] Providing hints to actually provide a real value over paper based sudokus
- [x] Shortcuts

### Features Todo:

- [ ] Save results of users
- [ ] Create a nice animation when the user won
- [ ] Provide motivating animations when finishing a line/square
- [ ] Offer users to generate their own unique sudokus
- [ ] Creating a challenge mode so two people can solve the same Sudoku side by side
- [ ] Add option to disable number highlights
- [ ] If a number is set, remove the notes that conflict with that number. Also when a hint is used.
- [ ] Keep the notes, even if a number is set
- [ ] If tabs are switched, scroll to top
- [ ] When you scroll all the way to the bottom the modal itself scrolled and the tab bar got hidden. Make sure that the modal is never higher than 100vh.
- [ ] Time keeps going when you select a new game.

## Setup

```
yarn install
yarn start
```

The app should be available on `https://localhost:3000`.

## Solve & Generate Sudokus

A generator was build to create an infinite amount of sudokus for every difficulty Level.
The generator is mostly based on the paper "Rating and Generating Sudoku Puzzles Based On Constraint Satisfaction Problems".
Currently I include a few hundred sudokus with this app, in the future it would be nice if a user could generate more if he would like to / having an interface to create new sudokus.

There are two scripts included in this project:

* `generate_sudokus.ts` - given a difficulty level and number of sudokus it will generate these and append the results to the `sudokus.txt` file
* `read_sudokus.ts` - reads the `sudokus.txt` file and creates a `sudokus.json` which is used in the application itself. It adds some more data and changes the datastructure. The contents need then to be placed in `src/assets/sudokus.ts`. I also format the file with prettier, to make it prettier.

## Contribution

Every contribution is welcome! Simply fork the project and create a PR.
