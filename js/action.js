(function () {
  var run;
  var dicke = 50;
  var bounds = [];
  var bullets = [];
  var hitBoundsTable = [];
  var hitBulletsTable = [];
  var letzteZeit = new Date().getTime();
  var dieseZeit;
  var elapsed;

  var trennCounter = 0;
  var TRENN_TIME = 60;
  var getrennt = false;

  var leinwand = document.getElementById('leinwand_1');
  var context = leinwand.getContext('2d');
  //make bullets
  var bullet = new DCP.Bullet(new DCP.Vektor2D(100, 100), 50, 100, new DCP.Vektor2D(300, 300), 1);
  bullets.push(bullet);
  var bullet = new DCP.Bullet(new DCP.Vektor2D(400, 300), 10, 30, new DCP.Vektor2D(-50, -90), 1);
  bullets.push(bullet);
  for (var i = 0; i < 5; i++) {
    var x = Math.random() * 500 + 100;
    var y = Math.random() * 400 + 100;
    var radius = Math.random() * 20 + 10;
    var speedX = (Math.random() * 100 - 200);
    var speedY = (Math.random() * 100 - 200);
    var mass = radius * 3;
    //var bullet = new DCP.Bullet(new DCP.Vektor2D(200 * (i + 1), 100), 30, 100, new DCP.Vektor2D(-(i+1)* 100, 200), 1);
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
  
  //die hitTables
  //hitBoundsTable
  for(var i = 0; i < bounds.length; i++){
    var bulletsArr = [];
    for (var j = 0; j < bullets.length; j++) {
      bulletsArr.push({
        getrennt: false,
        trennCounter: 0
      });
    }
    hitBoundsTable.push(bulletsArr);
  }
  
  //hitBulletsTable
  for(var i = 0; i < bullets.length; i++) {
    var tempArr = [];
    for(var j = 0; j < bullets.length; j++) {
      tempArr.push({
        getrennt: false,
        trennCounter: 0
      });
    }
    hitBulletsTable.push(tempArr);
  }
  


  document.addEventListener('keydown', function (evt) {
    if (evt.keyCode == 81) {
      clearInterval(run);
    }
  });

  //gameloop
  var run = setInterval(function () {
    //console.log(bullets[0].ortsvektorMP.x, bullets[0].ortsvektorMP.y);
    DCP.Polygon.cleanCanvas(context);
    dieseZeit = new Date().getTime();
    elapsed = dieseZeit - letzteZeit;
    letzteZeit = dieseZeit;
    var fps = elapsed / 1000;
    
    //hit Tables aktualisieren
    //hitBoundsTable
    for(var i = 0; i < hitBoundsTable.length; i++){
      for(var j = 0; j < hitBoundsTable[i].length; j++) {
        hitBoundsTable[i][j].trennCounter += elapsed;
        if(hitBoundsTable[i][j].trennCounter > TRENN_TIME) {
          hitBoundsTable[i][j].getrennt = false;
          hitBoundsTable[i][j].trennCounter = 0;
        }
      }
    }
    //hitBulletsTable
    for(var i = 0; i < hitBulletsTable.length; i++) {
      for(var j = 0; j < hitBulletsTable.length; j++) {
        hitBulletsTable[i][j].trennCounter += elapsed;
        if(hitBulletsTable[i][j].trennCounter > TRENN_TIME) {
          hitBulletsTable[i][j].getrennt = false;
          hitBulletsTable[i][j].trennCounter = 0;
        }
      }
    }

    for (var i = 0; i < bullets.length; i++) {
      for (var j = i; j < bullets.length; j++) {
        if (j != i) {
          if (!hitBulletsTable[i][j].getrennt) {
            hitBulletsTable[i][j].getrennt = DCP.Bullet.stoss(bullets[i], bullets[j]);
          }
        }
      }
      //gleich die bounds
      for (var k = 0; k < bounds.length; k++) {
        if(!hitBoundsTable[k][i].getrennt){
          hitBoundsTable[k][i].getrennt = DCP.Bullet.stossBound(bullets[i], bounds[k]);
        }
      }
    }


    for (var i = 0; i < bullets.length; i++) {
      bullets[i].move(fps);
      bullets[i].draw(context, false, false);
    }
    for (var i = 0; i < bounds.length; i++) {
      bounds[i].draw(context, false, false);
    }
  }, 30);




}).call(this);