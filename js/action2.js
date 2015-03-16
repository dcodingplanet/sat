(function(){
  var run;
  var dicke = 50;
  var bounds = [];
  var bullets = [];
  var letzteZeit = new Date().getTime();
  var dieseZeit;
  var elapsed;

  var trennCounter = 0;
  var TRENN_TIME = 10;
  var getrennt = false;

  var leinwand = document.getElementById('leinwand_1');
  var context = leinwand.getContext('2d');
  //make bullets
  for (var i = 0; i < 10; i++) {
    var x = Math.random() * 500 + 100;
    var y = Math.random() * 400 + 100;
    var radius = Math.random() * 30 + 10;
    var speedX = (Math.random() * 100 - 200);
    var speedY = (Math.random() * 100 - 200);
    var mass = radius * 3;
    var bullet = new DCP.Bullet(new DCP.Vektor2D(x, y), radius, mass, new DCP.Vektor2D(speedX, speedY), 1);
    bullets.push(bullet);
  }
  //die bounds in ein array
  var boundLeft = new DCP.Polygon([
    new DCP.Vektor2D(-dicke, 0),
    new DCP.Vektor2D(-dicke, 600),
    new DCP.Vektor2D(dicke, 600),
    new DCP.Vektor2D(dicke, 0)
  ]);
  bounds.push(boundLeft);

  var boundUp = new DCP.Polygon([
    new DCP.Vektor2D(0, -dicke),
    new DCP.Vektor2D(0, dicke),
    new DCP.Vektor2D(800, dicke),
    new DCP.Vektor2D(800, -dicke)
  ]);
  bounds.push(boundUp);


  var boundRight = new DCP.Polygon([
    new DCP.Vektor2D(800 - dicke, 0),
    new DCP.Vektor2D(800 - dicke, 600),
    new DCP.Vektor2D(800 + dicke, 600),
    new DCP.Vektor2D(800 + dicke, 0)
  ]);
  bounds.push(boundRight);


  var boundBottom = new DCP.Polygon([
    new DCP.Vektor2D(0, 600 - dicke),
    new DCP.Vektor2D(0, 600 + dicke),
    new DCP.Vektor2D(800, 600 + dicke),
    new DCP.Vektor2D(800, 600 - dicke)
  ]);
  bounds.push(boundBottom);
  
  document.addEventListener('keydown', function (evt) {
    if (evt.keyCode == 81) {
      clearInterval(run);
    }
  });
  
  var run = setInterval(function(){
    DCP.Polygon.cleanCanvas(context);
    dieseZeit = new Date().getTime();
    elapsed = dieseZeit - letzteZeit;
    letzteZeit = dieseZeit;
    var fps = elapsed / 1000;
    //DCP.Bullet.stoss(bullets[0], bullets[1]);
    
    for (var i = 0; i < bullets.length; i++) {
      for (var j = i; j < bullets.length; j++) {
        if(i != j){
          DCP.Bullet.stoss(bullets[i], bullets[j]);
        }
      }
      for (var k = 0; k < bounds.length; k++) {
        DCP.Bullet.stossBound(bullets[i], bounds[k]);
      }
    }
    
    
    //malen
    for (var i = 0; i < bullets.length; i++) {
      bullets[i].move(fps);
      bullets[i].draw(context, false, false);
    }
    for (var i = 0; i < bounds.length; i++) {
      bounds[i].draw(context, false, false);
    }
    
  }, 30);
  
}).call(this);

