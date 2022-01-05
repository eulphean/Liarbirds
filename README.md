# Liarbirds
Commissioned by [Hyde Park Art Center](https://www.hydeparkart.org/) in Chicago, [Liarbirds](https://liarbirds.art) is an interactive Augmented Reality project developed by Amay Kataria & Phil Mulliken. It is an augmented encounter developed within the ecosystem of Instagram to respond to online communities manifested around fringe ideas like conspiracy theories that permeate our everyday culture. In particular, it takes the idea “Birds aren’t real” as a point of departure, which claims that pigeons are in fact drones deployed by the United States government to surveil the population. Liarbirds is a play on this cultural phenomenon that makes fake birds real again by superimposing a swarm of digital creatures on one’s physical space through the mediation of Augmented Reality. These digital birds respond to user gestures while occupying a space of hybridity and emergent behavior. 

![liarbirds_front](https://user-images.githubusercontent.com/4178424/148282777-fae175de-41f1-4b53-8da7-d24ee81addd9.png)
<p align="center">
  <img src="https://user-images.githubusercontent.com/4178424/148282790-d48e9dc1-d4bb-42f7-aeba-d0897d468b65.jpg">
</p>

### Build process
To run the work, open the BoidsFromGround project from Production folder.<br>
Here are the steps to get started.
<br><br>
1: Install node/npm<br>
2: Open terminal and go to the BoidsFromGround folder in Production<br>
3: Type npm install. This will install all the dependencies for the project.<br>
4: There are 2 commands that we can use:<br>
### npm run dev
This will compile a script.js and put it in the scripts folder. But it will also ensure that there are source maps for all the code. This can be useful when you're in active development and want to debug your code. Spark doesn't give us a lot of capability but having the source maps is very useful when an error comes.<br><br>
### npm run build
This will compile a script.js and put it in the scripts folder. But it will minify the javascript, so you can't look at anything in the compiled code. We will use this when we are finally exporting the app to Instagram.<br><br>
### Development flow:
We should type npm run dev and keep developing. With every change, webpack compiles the javascript and throws any error if there are any. If the compile is successfull, then we can use SparkAR to run the project.
