var DCP = DCP || {};
/**
 * Die Klasse erzeugt einen Kreis mit Position im R2 und einem Radius
 * @param {DCP.Vektor2D} ortsvektorMP der Ortsvektor zum Mittelpunkt
 * @param {Number} radius der Radius des Kreises
 */
DCP.Circle = function (ortsvektorMP, radius) {
  if (ortsvektorMP instanceof DCP.Vektor2D) {
    this.ortsvektorMP = ortsvektorMP;
    this.radius = (typeof radius !== 'undefined' && typeof radius === 'number') ? radius : 1;

  }
  else {
    throw new Error("dem Circle Konstruktor muss ein DCP.Vektor2D Objekt uebergeben werden!");
  }
};
DCP.Circle.prototype.constructor = DCP.Circle;
DCP.Circle.prototype = {
  /**
   * Diese Funktion nimmt den 2d-context eines Canvas Objekts entgegen um darauf
   * den Circle zu zeichnen.
   * @param {CanvasRenderingContext2D} context der 2d-context des Canvas Elements
   * @param {boolean} mitMP mit Mittelpunktsvektoren oder ohne default false
   * @param {boolean} mitSchnittFarbe mit Farbe wenn Schnitt vorliegt
   * @returns {undefined}
   */
  draw: function (context, mitMP, mitSchnittFarbe) {
    if (typeof mitMP === 'undefined') {
      mitMP = false;
    }
    if (typeof mitSchnittFarbe === 'undefined') {
      mitSchnittFarbe = false;
    }
    if (context instanceof  CanvasRenderingContext2D) {

      /*
       * Umstellen auf Vordergrundfarbe und Pfad oeffnen
       */
      context.strokeStyle = (mitSchnittFarbe) ? DCP.Colors.YELLOW : DCP.Colors.FG_COLOR;
      context.beginPath();
      context.arc(this.ortsvektorMP.x, this.ortsvektorMP.y, this.radius, 0, DCP.Measures.PI_2, true);
      context.closePath();
      context.stroke();

      /**
       * falls mitMP true, zeichne hier die Mittelpunktsvektoren
       */
      if (mitMP === true) {
        context.strokeStyle = DCP.Colors.BLUE;
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(this.ortsvektorMP.x, this.ortsvektorMP.y);
        context.closePath();
        context.stroke();
      }

    }
    else {
      throw new Error("Es muss ein CanvasRenderingContext2D - Objekt uebergeben werden");
    }
  },
  /**
   * Bewegt den Kreis zu einem Punkt im R2
   * @param {Number} x die x-Koordinate
   * @param {Number} y die y-Koordinate
   */
  moveTo: function (x, y) {
    this.ortsvektorMP.x = x;
    this.ortsvektorMP.y = y;
  },
  /**
   * Bewegt den Circle mit einem Vektor.
   * @param {DCP.Vektor2D} bewegungsVektor der Vektor mit dem der Kreis verschoben wird.
   */
  move: function (bewegungsVektor) {
    if (bewegungsVektor instanceof DCP.Vektor2D) {
      this.ortsvektorMP.x += bewegungsVektor.x;
      this.ortsvektorMP.y += bewegungsVektor.y;
    }
  }
};
/**
 * Prüft ob sich zwei Objekte der Klasse DCP.Circle schneiden und gibt true oder false zurueck
 * @param {DCP.Circle} circle1
 * @param {DCP.Circle} circle2
 * @returns {Boolean} true bei Schniit, false sonst
 */
DCP.Circle.kreisSchnitt = function (circle1, circle2) {
  /*
   * der Trennungsvektor zwischen den Mittelpunkten.
   * Er zeigt vom circle2 weg
   */
  var trennungsVektor = DCP.Vektor2D.differenzVektor(circle2.ortsvektorMP, circle1.ortsvektorMP);
  /*
   * Fuer eine schnelle Berechnung vergleicht man die quadrierten Abstaende
   */
  var laengeQuad = trennungsVektor.getLaengeQuad();
  /*
   * die Summe der Radien vom Abstand zwischen den Mittelpunkten abziehen, ist der negativ, dann gibt es einen Schnitt
   */
  var abstand = laengeQuad - (circle1.radius + circle2.radius) * (circle1.radius + circle2.radius);
  if (abstand <= 0) {
    return true;
  }
  else {
    return false;
  }
};

/**
 * Funktion prueft auf Schnitt und trennt je nachdem ob trennen gesetzt wurde.
 * Der Trennungsvektor wird von der Funktion zureckgegeben
 * @param {DCP.Circle} circle1
 * @param {DCP.Circle} circle2
 * @param {booelan} trennen die Kreise gleich trennen, oder nur den TrennungsVektor zurueckgeben.
 * @returns {DCP.Vektor2D} gibt einen Trennungsvektor zurueck, default der Nullvektor
 */
DCP.Circle.kreisKollision = function (circle1, circle2, trennen) {
  if (typeof trennen === 'undefined') {
    trennen = false;
  }
  /*
   * der Trennungsvektor soll vom circle2 wegzeigen
   */
  var trennungsVektor = DCP.Vektor2D.differenzVektor(circle2.ortsvektorMP, circle1.ortsvektorMP);
  /*
   * die Laenge des Trennungsvektors, wie beim Schnitt, aber dieses Mal nicht quadriert
   */
  var laenge = trennungsVektor.getLaenge();
  /*
   * den normierten Trennungsvektor, um die Verschiebung skalar zu multiplizieren
   */
  var normierterTrennungsVektor = new DCP.Vektor2D(trennungsVektor.x / laenge, trennungsVektor.y / laenge);
  /*
   * das Skalar ist die Differenz aus der strecke zwischen den Mittelpunkten und 
   * der Summe der Radien
   */
  var skalar = laenge - (circle1.radius + circle2.radius);
  /*
   * kleiner 0, also Schnitt
   */
  if (skalar < 0) {
    /*
     * den normierten Trennungsvektor skalar verlaengern mit dem Betrag der Differenz der Strecken
     */
    normierterTrennungsVektor.skalar(-skalar);
    if (trennen) {
      /*
       * wenn trennen flag gesetzt, dann trenne
       */
      circle1.move(normierterTrennungsVektor);
    }
    /*
     * gib den normierten und anschliessend skalierten Trennungsvektor zurueck
     */
    return normierterTrennungsVektor;
  }
  else {
    /*
     * kein Schnitt, also gib den NullVektor zurueck
     */
    return new DCP.Vektor2D(0, 0);
  }

};

DCP.Circle.kreisVsKreis = function (circle1, circle2) {
  var trennungsVektor = DCP.Vektor2D.differenzVektor(circle1.ortsvektorMP, circle2.ortsvektorMP);
  /*
   * die Laenge des Trennungsvektors, wie beim Schnitt, aber dieses Mal nicht quadriert
   */
  var laenge = trennungsVektor.getLaenge();
  /*
   * den normierten Trennungsvektor, um die Verschiebung skalar zu multiplizieren
   */
  var normierterTrennungsVektor = new DCP.Vektor2D(trennungsVektor.x / laenge, trennungsVektor.y / laenge);
  /*
   * das Skalar ist die Differenz aus der strecke zwischen den Mittelpunkten und 
   * der Summe der Radien
   */
  var skalar = laenge - (circle1.radius + circle2.radius);
  /*
   * kleiner 0, also Schnitt
   */
  if (skalar < 0) {
    return {
      skalar: -skalar,
      achse: normierterTrennungsVektor
    };
    
  }
  else {
    return {
      skalar: 0,
      achse: normierterTrennungsVektor
    };
  }

};


