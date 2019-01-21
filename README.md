# Particle Madness
Computational Graphics course, University of Zagreb, Lab 3.

Simulation of a system of particles on a GPU, dynamics, collision forces. Rendering of the underlying force field, two modes: direct mapping x-y to R-G or iso-surface option, with low-high cutoff for force magnitude and color for direction. Developed using three.js and dat.gui for running in a web browser.

<img src="https://raw.githubusercontent.com/deluksic/particle-madness/master/docs/example.png" width="400">

# Developing locally
Clone repo
```
git clone git@github.com:deluksic/particle-madness.git
```
Install node packages and start dev server
```
yarn install
yarn start
```
Open a web browser on `localhost:8080` to see it.

## See a live [demo](https://deluksic.github.io/particle-madness)
