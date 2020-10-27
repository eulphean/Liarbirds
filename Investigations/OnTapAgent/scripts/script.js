 
 const Scene = require('Scene');
 const TouchGestures = require('TouchGestures');
 const Diagnostics = require('Diagnostics');

 // Reference SphereObject from Scene
 Promise.all([
     Scene.root.findFirst('Cone0'),
     Scene.root.findFirst('Cone1'),
     Scene.root.findFirst('Cone2')
 ]).then(function (objects) {
     const cone0 = objects[0];
     const cone1 = objects[1]; 
     const cone2 = objects[2]; 

      TouchGestures.onTap(cone0).subscribe((gesture) => {
      	Diagnostics.log('Cone0 Touched'); 
  	  });

  	   TouchGestures.onTap(cone1).subscribe((gesture) => {
      	Diagnostics.log('Cone1 Touched'); 
  	  });

  	    TouchGestures.onTap(cone2).subscribe((gesture) => {
      	Diagnostics.log('Cone2 Touhed'); 
  	  });
 }); 
