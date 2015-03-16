var DCP = DCP || {};
/**
 * die Klasse Bullet. Sie erbt von Circle bzw. deren Konstruktor wird
 * aufgerfufen
 * @param {DCP.Vektor2D} ortsvektorMP
 * @param {Number} radius
 * @param {Number} mass
 * @param {DCP.Vektor2D} velocity
 * @param {Number} bounce zwischen 0 und 1;
 * @returns {undefined}
 */
DCP.Bullet = function (ortsvektorMP, radius, mass, velocity, bounce) {
  if (typeof mass === 'undefined') {
    mass = 0;
  }
  if (typeof bounce === 'undefined') {
    bounce = 0;
  }
  if (bounce > 0) {
    bounce = 0;
  }
  if (bounce > 1) {
    bounce = 1;
  }
  if (typeof velocity !== 'undefined' && !(velocity instanceof DCP.Vektor2D)) {
    throw new Error("die Velocity muss ein Vektor2D Objekt sein!");
  }
  /*
   * Aufruf des OberKonstruktors per call(this,..., ...)
   * this ist das thisArg, also der aktuelle this Kontext
   */
  DCP.Circle.call(this, ortsvektorMP, radius);
  this.mass = mass;
  this.reziprokeMasse = 1 / mass;
  this.velocity = velocity;
  this.bounce = bounce;
};
DCP.Bullet.prototype = Object.create(DCP.Circle.prototype);
DCP.Bullet.prototype.constructor = DCP.Bullet;

/**
 * Die Funktion move zum Bewegen
 * @param {Number} deltaTime das Delta t
 * @returns {undefined}
 */
DCP.Bullet.prototype.move = function (deltaTime) {
  this.ortsvektorMP.x += this.velocity.x * deltaTime;
  this.ortsvektorMP.y += this.velocity.y * deltaTime;
};
/**
 * Die Funktion stoss: Sie berechnet und setzt aus den beiden eingegangenen Geschwindigkeiten
 * und der Trennungsachse die neuen Geschwindigkeitsvektoren  und gibt true oder false zurueck.
 * @param {DCP.Circle} k1
 * @param {DCP.Circle} k2
 * @returns {Boolean} true bei stoss, sonst false
 */
DCP.Bullet.stoss = function (k1, k2) {
  var schnitt = DCP.Circle.kreisVsKreis(k1, k2);

  if (schnitt.skalar == 0) {
    return false;
  }
  else {
    //die zentrale Achse und die Tangente, beide normiert
    var z = schnitt.achse;
    var t = new DCP.Vektor2D(-z.y, z.x);

    //die relative Geschwindigkeit der beiden Objekte
    var vRel = DCP.Vektor2D.differenzVektor(k1.velocity, k2.velocity);
    //wenn skalarprodukt vom mtv und vRel > 0, dann raus. relative Geschwndigkeit auf z 
    var vRelAufz = DCP.Vektor2D.skalarProdukt(vRel, z);
    if (vRelAufz > 0) {
      return false;
    }

    //die Geschwindigkeiten und die Massen
    var v1 = k1.velocity;
    var v2 = k2.velocity;
    var m1 = k1.mass;
    var m2 = k2.mass;
    var teiler = 1 / (m1 + m2);

    //Betrag der Geschwindigkeiten auf zentralAchse n
    var z1 = DCP.Vektor2D.skalarProdukt(v1, z);
    var z2 = DCP.Vektor2D.skalarProdukt(v2, z);
    //Betrag der Geschwindigkeiten auf zentralAchse t
    var t1 = DCP.Vektor2D.skalarProdukt(v1, t);
    var t2 = DCP.Vektor2D.skalarProdukt(v2, t);

    //eindimensionalen elastischen stoss fuer beide Geschwindigkeitsbetraege
    var u1 = (m1 * z1 + m2 * (2 * z2 - z1)) * teiler;
    var u2 = (m2 * z2 + m1 * (2 * z1 - z2)) * teiler;

    //die Vektoren erzeugen, indem man die Betraege mit den normierten Achsen multipliziert
    //t1 und t2 bleiben konstant, da stoss nur in Zentralrichtung
    var uz1 = z.skalarMulti(u1);
    var uz2 = z.skalarMulti(u2);
    var tt1 = t.skalarMulti(t1);
    var tt2 = t.skalarMulti(t2);

    //neue Geschwindigkeitsvektoren setzen, als Summe der beiden Vektoranteile
    //jeweils einer zentral und einer tangential
    k1.velocity = DCP.Vektor2D.add(uz1, tt1);
    k2.velocity = DCP.Vektor2D.add(uz2, tt2);
    return true;
  }
};

/**
 * Die Funktion stossBound: Macht dasselbe wie die Funktion stoss, nur betrachtet
 * sie einen stoss zwischen einem Polygon und einem Kreis
 * @param {DCP.Circle} k1
 * @param {DCP.Polygon} poly
 * @returns {Boolean}
 */
DCP.Bullet.stossBound = function (k1, poly) {
  var schnitt = DCP.Polygon.polyVsKreis(poly, k1);
  if (schnitt.skalar == 0) {
    return false;
  }
  else {
    var z = schnitt.achse;
    var t = new DCP.Vektor2D(-z.y, z.x);
    
    var v1 = k1.velocity;
    var v2 = new DCP.Vektor2D(0, 0);

    var m1 = k1.mass;
    var m2 = DCP.Measures.MASS_MAX;
    var teiler = 1 / (m1 + m2);

    //Betrag der Geschwindigkeiten auf zentralAchse n
    var z1 = DCP.Vektor2D.skalarProdukt(v1, z);
    var z2 = 0;
    var t1 = DCP.Vektor2D.skalarProdukt(v1, t);
    var t2 = 0;

    var u1 = (m1 * z1 - m2 * z1) * teiler;
    var u2 = m1 * (2 * z1) * teiler;

    //die Vektoren erzeugen
    var uz1 = z.skalarMulti(u1);
    var tt1 = t.skalarMulti(t1);


    k1.velocity = DCP.Vektor2D.add(uz1, tt1);
    return true;
  }
};