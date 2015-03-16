var DCP = DCP || {};

DCP.Vektor2D = function (x, y) {
  if (typeof x == 'undefined' || typeof y == 'undefined') {
    this.x = 0;
    this.y = 0;
  }
  else {
    this.x = x;
    this.y = y;
  }
};

DCP.Vektor2D.prototype = {
  /**
   * Gibt den zugehoerigen NormalenVektor zurueck
   * @returns {DCP.Vektor2D}
   */
  getNormalenVektor: function () {
    return new DCP.Vektor2D(-this.y, this.x);
  },
  /**
   * Gibt den zugehoerigen normierten NormalenVektor zurueck
   * @returns {DCP.Vektor2D}
   */
  getNormalenEiheitsVektor: function () {
    var v = this.getNormalenVektor();
    var laenge = Math.sqrt(v.getLaengeQuad());
      v.x = v.x / laenge;
      v.y = v.y / laenge;
    return v;
  },
  /**
   * Gibt die Laenge des Vektors quadriert zurueck
   * @returns {Number}
   */
  getLaengeQuad: function () {
    return (this.x * this.x + this.y * this.y);
  },
  /**
   * Gibt die Laenge des Vektors zurueck
   * @returns {Number}
   */
  getLaenge: function () {
    return Math.sqrt(this.getLaengeQuad());
  },
  /**
   * skaliert den Vektor mit einer reelen Zahl Lambda
   * @param {type} lamda eine reele Zahl
   */
  skalar: function (lamda) {
    this.x *= lamda;
    this.y *= lamda;
  },
  /**
   * Gibt einen Vektor zurueck, der lamda Faches dieses Vektors ist.
   * @param {Number} lamda
   * @returns {DCP.Vektor2D}
   */
  skalarMulti: function (lamda) {
    return new DCP.Vektor2D(this.x * lamda, this.y * lamda);
  },
  /**
   * Normiert den Vektor und gibt ihn als neuen Vektor zurueck
   * @returns {DCP.Vektor2D}
   */
  normieren: function () {
    var laenge = this.getLaenge();
    if (laenge != 0) {
      var x = this.x / this.getLaenge();
      var y = this.y / this.getLaenge();
      return new DCP.Vektor2D(x, y);
    }
    else{
      return new DCP.Vektor2D(0, 0);
    }
  }
};

/**
 * gibt das das reelle Skalarprodukt der beiden Vektoren u und v zurueck
 * @static
 * @param {DCP.Vektor2D} u
 * @param {DCP.Vektor2D} v
 * @returns {Number} das reelle Skalarprodukt der beiden Vektoren u und v
 */
DCP.Vektor2D.skalarProdukt = function (u, v) {
  if (u instanceof DCP.Vektor2D && v instanceof DCP.Vektor2D) {
    return u.x * v.x + u.y * v.y;
  }
};
/**
 * Gibt den Differenzvektor zweier Ortsvektoren zurueck.
 * Spitze minus Fuss
 * @static
 * @param {DCP.Vektor2D} u der Fuss
 * @param {DCP.Vektor2D} v die Spitze
 * @returns {DCP.Vektor2D} den Differenzvektor
 */
DCP.Vektor2D.differenzVektor = function (u, v) {
  var x = v.x - u.x;
  var y = v.y - u.y;
  return new DCP.Vektor2D(x, y);
};
/**
 * Die Projektion von Vektor a auf Vektor b
 * @static
 * @param {DCP.Vektor2D} a
 * @param {DCP.Vektor2D} b
 * @returns {DCP.Vektor2D} den Projektionsvektor
 */
DCP.Vektor2D.projektionsVektor = function (a, b) {
  var px = (DCP.Vektor2D.skalarProdukt(a, b) / b.getLaengeQuad()) * b.x;
  var py = (DCP.Vektor2D.skalarProdukt(a, b) / b.getLaengeQuad()) * b.y;
  return new DCP.Vektor2D(px, py);
};

/**
 * Funktion, die zwei Vektoren nimmt und true oder false zurueckgibt.
 * Die beiden Vektoren mussen direkt gleich sein, also nicht nur linear abhaengig
 * @static
 * @param {DCP.Vektor2D} u
 * @param {DCP.Vektor2D} v
 * @returns {Boolean} gibt falsch zurueck wenn 2 Vektoren nicht gleich, sonst true
 */
DCP.Vektor2D.isEqual = function (u, v) {
  return (u.x == v.x && u.y == v.y) ? true : false;
};

DCP.Vektor2D.add = function (u, v) {
  return new DCP.Vektor2D(u.x + v.x, u.y + v.y);
};