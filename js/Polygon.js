/**
 * der Namensraum DCP
 */
var DCP = DCP || {};

/**
 * Der Konstruktor der Klasse Polygon
 * @constructor
 * Dem Konstruktor wird ein Array von Ortsvektoren uebergeben.
 * Klassischerweise uebergibt man die Ortsvektoren zu den Punkten A1 bis An
 * gegen den Uhrzeigersinn(also mathematisch positiv), 
 * wie bei einem Rechteck in der Schule gelernt.
 * So kann man die Seitenvektoren einfach aus dem 
 * Ortsvektor A(n+1) minus dem Ortsvektor zu A(n) 
 * als Spitze minus Fuss berechnen.
 * @param {Array} ortsvektoren
 */
DCP.Polygon = function (ortsvektoren) {
  if (ortsvektoren instanceof Array) {
    /**
     * Array: die Ortsvektoren
     */
    this.ortsvektoren = ortsvektoren;
    /**
     * Array: die Seiten des Polygons
     */
    this.seiten = [];
    /**
     * Array: die achsen des Polygons
     */
    this.achsen = [];
    /**
     * die Anzahl an Ortsvektoren im Array
     */
    this.laenge = this.ortsvektoren.length;


    var seite = null;
    var achse = null;
    /**
     * In dieser Schleife werden die Achsen und Seiten des Polygons berechnet.
     * Die Achse wird hier als rechtseitiger normierter NormalenVektor der Seite
     * berechnet. Da das Polygon gegen den Uhrzeigersinn definiert ist, zeigen alle
     * Achsen vom Polygon weg. Wuerde man linksseitige Normalen nehmen, wuerden
     * alle Achsen in das Polygon zeigen.
     */
    for (var i = 0; i < this.laenge; i++) {
      /**
       * fuer die letzte Verbindung wird A(n) gleich A(0)
       */

      var j = (i < this.laenge - 1) ? i + 1 : 0;
      seite = DCP.Vektor2D.differenzVektor(this.ortsvektoren[i], this.ortsvektoren[j]);
      this.seiten.push(seite);

      /*
       * die Achse wird als normierter Normalenvektor berechnet, da dieser sowieso
       * spaeter zur Projektion benoetigt wird.
       */
      achse = seite.getNormalenEiheitsVektor();
      this.achsen.push(achse);
    }
  }
  else {
    throw new Error('Der Konstruktor akzeptiert nur ein Array aus Vektorobjekten');
  }
};

DCP.Polygon.prototype = {
  /**
   * Diese Funktion nimmt den 2d-context eines Canvas Objekts entgegen um darauf
   * das Polygon als Pfad zu zeichnen.
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
      context.moveTo(this.ortsvektoren[0].x, this.ortsvektoren[0].y);
      for (var i = 1; i < this.ortsvektoren.length; i++) {
        context.lineTo(this.ortsvektoren[i].x, this.ortsvektoren[i].y);
      }
      context.lineTo(this.ortsvektoren[0].x, this.ortsvektoren[0].y);
      /*
       * Pfad schliessen aund anschliessend zeichnen
       */
      context.closePath();
      context.stroke();

      /**
       * falls mitMP true, zeichne hier die Mittelpunktsvektoren
       */
      if (mitMP === true) {
        context.strokeStyle = DCP.Colors.BLUE;
        context.beginPath();
        context.moveTo(0, 0);
        var mp = this.getMittelpunkt();
        context.lineTo(mp.x, mp.y);
        context.closePath();
        context.stroke();
      }

    }
    else {
      throw new Error("Es muss ein CanvasRenderingContext2D - Objekt uebergeben werden");
    }
  },
  /**
   * Diese Funktion liefert den Ortsvetor zum Mittelpunkt, bzw. Massenschwerpunkt
   * des konvexen, nicht überschlagenen Polygons zurueck.
   * Hierbei wird zuerst der Flaecheninhalt mit der Dreiecksformel von Gauss ermittelt.
   * Ueber diesen Flaecheninhalt bekommt man die kartesischen Koordinaten des Mittelpunkts
   * bzw. des Schwerpunkts.
   * @returns {DCP.Vektor2D} der Ortsvektor zum Mittelpunkt
   */
  getMittelpunkt: function () {
    /*
     * Die halbe Flaeche wird benoetigt um in der Schwerpunktsformel 
     * statt mit dem Teiler (6 * Flaeche) mit (3 * flaecheHalb) zu rechnen
     */
    var flaecheHalb = 0;
    var x = 0;
    var y = 0;

    /*
     * In einer Schleife wird zuerst die Flaeche nach der Dreiecksformel berechnet.
     * Diese benoetigt man fuer die Schwerpunktsformel.
     */
    for (var i = 0; i < this.ortsvektoren.length; i++) {
      //letzter x Wert wird mit 0-tem y Wert multipliziert und vice versa
      var j = i + 1;
      if (j == this.ortsvektoren.length) {
        j = 0;
      }
      flaecheHalb += (this.ortsvektoren[i].x * this.ortsvektoren[j].y - this.ortsvektoren[j].x * this.ortsvektoren[i].y);
    }


    /*
     * In einer Schleife wird das (6 * flaeche) - fache der x und y Anteile der
     * Mittelpunktsvektoren berechnet
     */
    for (var i = 0; i < this.ortsvektoren.length; i++) {
      //letzter x Wert wird mit 0-tem y Wert multipliziert und vice versa
      var j = i + 1;
      if (j == this.ortsvektoren.length) {
        j = 0;
      }
      x += (this.ortsvektoren[i].x + this.ortsvektoren[j].x) *
              (this.ortsvektoren[i].x * this.ortsvektoren[j].y - this.ortsvektoren[j].x * this.ortsvektoren[i].y);
      y += (this.ortsvektoren[i].y + this.ortsvektoren[j].y) *
              (this.ortsvektoren[i].x * this.ortsvektoren[j].y - this.ortsvektoren[j].x * this.ortsvektoren[i].y);
    }
    /*
     * die berechneten Werte werden durch den Teiler (3 * flaecheHalb) 
     * bzw (6 * flaeche) geteilt.
     */
    var teiler = flaecheHalb * 3;
    x = x / teiler;
    y = y / teiler;

    return new DCP.Vektor2D(x, y);
  },
  /**
   * 
   * @param {DCP.Vektor2D} bewegungsVektor  
   */
  move: function (bewegungsVektor) {
    if (bewegungsVektor instanceof DCP.Vektor2D) {
      for (var i = 0; i < this.ortsvektoren.length; i++) {
        this.ortsvektoren[i].x = this.ortsvektoren[i].x + bewegungsVektor.x;
        this.ortsvektoren[i].y = this.ortsvektoren[i].y + bewegungsVektor.y;
      }
    }
  }
};


/**
 * kollision:
 * @static
 * Diese Funktion gibt einen Trennungsvektor zurueck, mit dem Polygon1 aus Polygon2
 * hreausgeschoben werden kann.
 * @param {DCP.Polygon} poly1 das erste Polygon. Im Falle einer Trennung wird dieses aus poly2
 * herausgeschoben.
 * @param {DCP.Polygon} poly2 das zweite Polygon.
 * @returns {DCP.Vektor2D}
 */
DCP.Polygon.kollision = function (poly1, poly2) {
  if (poly1 instanceof DCP.Polygon && poly2 instanceof DCP.Polygon) {
    /*
     * Diese beiden Variablen benoetigt man um die beiden Polygone zu trennen.
     * Das trennungsSkalar ist der Wert den man aus dem Betrag der Ueberlappung
     * der Projektionen erhaelt. Der trennungsVektor ist der normierte Vektor, der 
     * mit dem trennungSkalar multipliziert wird. 
     */
    var trennungsSkalar = Number.MAX_VALUE;
    var trennungsVektor = null;
    /*
     * alleSeiten und alleAchsen, die schon im Konstruktor des Polygons 
     * erzeugt werden, werden hier in jeweils ein Array gepackt.
     */
    var alleSeiten = poly1.seiten.concat(poly2.seiten);
    var alleAchsen = poly1.achsen.concat(poly2.achsen);

    /*
     * for Schleife ueber alle Achsen
     */
    for (var i = 0; i < alleAchsen.length; i++) {
      /*
       * temporaere Variablen
       */
      var seite = alleSeiten[i];
      var achse = alleAchsen[i];
      /*
       * die Variablen fuer die eindimensionalen Projektionen der Koerper auf
       * die Achse. Fuer die maximalen Werte wird die betragsgroesste Negative Zahl, 
       * und fuer die minimalen Werte die betragsgroesste positive Zahl gesetzt. 
       * Dies garantiert eine Zuweisung im erfsten Durchlauf.
       *  
       */
      var maxProj1 = -Number.MAX_VALUE;
      var maxProj2 = -Number.MAX_VALUE;
      var minProj1 = Number.MAX_VALUE;
      var minProj2 = Number.MAX_VALUE;

      /*
       * Temporaere Variablen fuer die inneren Schleifendurchlaeufe.
       * Der ort speichert den aktuellen Ortsvektor.
       * Das Skalar den aktuellen Wert der Projektion auf dem (schon im Kontruktor) 
       * normierten Vektor der aktuellen Achse.
       */
      var ort;
      var skalar;

      //Projektion des ersten Koerpers
      for (var j = 0; j < poly1.ortsvektoren.length; j++) {
        ort = poly1.ortsvektoren[j];
        /*
         * hier versteckt sich direkt der Wert, der Projektion, da Achse normiert
         */
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj1) {
          maxProj1 = skalar;
        }
        if (skalar < minProj1) {
          minProj1 = skalar;
        }
      }
      //Projektion des zweiten Koerpers
      for (var j = 0; j < poly2.ortsvektoren.length; j++) {
        ort = poly2.ortsvektoren[j];
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj2) {
          maxProj2 = skalar;
        }
        if (skalar < minProj2) {
          minProj2 = skalar;
        }
      }
      /*
       * Testen der eindimensionalen strecken auf Schnitt. Wenn kein schnitt, dann raus
       * Die Polygone koennen sich nicht schneiden, wenn mindestens eine Trennungsachse gefunden wird!!!
       */
      if ((maxProj2 < minProj1 && minProj2 < minProj1) || (minProj2 > maxProj1 && maxProj2 > maxProj1)) {
        /*
         * kein Schnitt, also raus bzw return false
         */
        return false;
      }
      else {
        /*
         * Ansonsten gibt es einen Schnitt der eindimensionalen Projektionen
         * im aktuellen Durchlauf der Achsen.
         * Will man den Vektor ermitteln, mit dem man Polygon1 von Polygon2 trennt,
         * so muss man hier die Faelle betrachten, wo ein Schnitt eintritt.
         * Es gilt den kleinsten Wert zu finden, und ihn als trennungSkalar zusammen mit dem
         * trennungsVektor (einfach der aktuellen Achse) in den beiden Eingangs 
         * definierten globalen Variablen zwischenzuspeichern. 
         */
        var o = Number.MAX_VALUE;
        var u = Number.MAX_VALUE;
        var v = Number.MAX_VALUE;
        /*
         * Schnitt von links
         */
        if (maxProj1 > minProj2 && minProj1 < minProj2) {
          o = maxProj1 - minProj2;
        }
        /*
         * Schnitt von rechts
         */
        else if (maxProj1 > maxProj2 && minProj1 < maxProj2) {
          o = maxProj2 - minProj1;
        }
        /*
         *Proj1 ist enthalten in Proj2
         */
        else if (maxProj1 < maxProj2 && minProj1 > minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }
        /*
         * Proj1 enthaelt Proj2
         */
        else if (maxProj1 > maxProj2 && minProj1 < minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }

        if (o < trennungsSkalar) {
          trennungsSkalar = o;
          trennungsVektor = achse;

        }
      }

    }

    /*
     * der Vektor mittelPunktsBeziehung ist ein Vektor, der die beiden Mittelpunkte
     * (FussPunkt) poly2 und (Kopfpunkt) poly1 verbindet.
     * Seine Laenge ist der Abstand zwischen den beiden Mittelpunkten.
     * Seine Richtung ist die Richtung, die von poly2 wegzeigt.
     */
    var mittelPunktsBeziehung = DCP.Vektor2D.differenzVektor(poly2.getMittelpunkt(), poly1.getMittelpunkt());
    /*
     * Der TrennungsVektor muss vom poly2 wegzeigen, also genau dorthin wo der Vektor
     * mittelPunktsBeziehung zeigt. Nämlich hin zum Mittelpunkt von poly1.
     * Das kann man mit dem Skalarprodukt beider Vektoren testen.
     * Wenn dies kleiner null ist passt man mit einer 
     * Skalarmultiplikation mit -1 den trennungsVektor einfach an.
     */
    if (DCP.Vektor2D.skalarProdukt(trennungsVektor, mittelPunktsBeziehung) < 0) {
      trennungsVektor.x *= -1;
      trennungsVektor.y *= -1;
    }

    /*
     * An diesem Punkt sind alle Achsen durchlaufen. Wir geben hier den mit dem
     * trennungsSkalar multiplizierten trennungsVektor zurueck. Dieser hat dann
     * genau die Richtung und die Laenge um das Polygon 1 aus dem Polygon 2 
     * herauszuschieben.
     */
    return new DCP.Vektor2D(trennungsVektor.x * trennungsSkalar, trennungsVektor.y * trennungsSkalar);
  }
  else {
    throw new Error("Es muessen zwei Polygone an die Funktion kollision uebergeben werden");
  }
};

/**
 * schnitt:
 * @static
 * Diese Funktion prueft ob sich zwei konvexe Polygone schneiden und gibt true
 * bei Schnitt, sonst false zurueck
 * @param {DCP.Polygon} poly1 das erste Polygon
 * @param {DCP.Polygon} poly2 das zweite Polygon
 * @returns {Boolean} false wenn kein Schnitt, sonst true
 */
DCP.Polygon.schnitt = function (poly1, poly2) {
  if (poly1 instanceof DCP.Polygon && poly2 instanceof DCP.Polygon) {
    /*
     * alleSeiten und alleAchsen, die schon im Konstruktor des Polygons 
     * erzeugt werden, werden hier in jeweils ein Array gepackt.
     */
    var alleSeiten = poly1.seiten.concat(poly2.seiten);
    var alleAchsen = poly1.achsen.concat(poly2.achsen);

    /*
     * for Schleife ueber alle Achsen
     */
    for (var i = 0; i < alleAchsen.length; i++) {
      /*
       * temporaere Variablen
       */
      var seite = alleSeiten[i];
      var achse = alleAchsen[i];
      /*
       * die Variablen fuer die eindimensionalen Projektionen der Koerper auf
       * die Achse. Fuer die maximalen Werte wird die betragsgroesste Negative Zahl, 
       * und fuer die minimalen Werte die betragsgroesste positive Zahl gesetzt. 
       * Dies garantiert eine Zuweisung im erfsten Durchlauf.
       *  
       */
      var maxProj1 = -Number.MAX_VALUE;
      var maxProj2 = -Number.MAX_VALUE;
      var minProj1 = Number.MAX_VALUE;
      var minProj2 = Number.MAX_VALUE;

      /*
       * Temporaere Variablen fuer die inneren Schleifendurchlaeufe.
       * Der ort speichert den aktuellen Ortsvektor.
       * Das Skalar den aktuellen Wert der Projektion auf dem (schon im Kontruktor) 
       * normierten Vektor der aktuellen Achse.
       */
      var ort;
      var skalar;

      //Projektion des ersten Koerpers
      for (var j = 0; j < poly1.ortsvektoren.length; j++) {
        ort = poly1.ortsvektoren[j];
        /*
         * hier versteckt sich direkt der Wert, der Projektion, da Achse normiert
         */
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj1) {
          maxProj1 = skalar;
        }
        if (skalar < minProj1) {
          minProj1 = skalar;
        }
      }
      //Projektion des zweiten Koerpers
      for (var j = 0; j < poly2.ortsvektoren.length; j++) {
        ort = poly2.ortsvektoren[j];
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj2) {
          maxProj2 = skalar;
        }
        if (skalar < minProj2) {
          minProj2 = skalar;
        }
      }
      /*
       * Testen der eindimensionalen strecken auf Schnitt. Wenn kein schnitt, dann raus
       * Die Polygone koennen sich nicht schneiden, wenn mindestens eine Trennungsachse gefunden wird!!!
       */
      /*
       if ((maxProj2 < minProj1 && minProj2 < minProj1) || (minProj2 > maxProj1 && maxProj2 > maxProj1)) {
       return false;
       }
       */
      if ((maxProj1 < minProj2) || (minProj1 > maxProj2)) {
        return false;
      }

    }
    /*
     * Achsendurchlauf Ende, und somit gibt es einen Schnitt der beiden Polygone
     */
    return true;
  }
  else {
    throw new Error("Es muessen zwei Polygone an die Funktion schnitt uebergeben werden");
  }
};

/**
 * Diese Funktion testet ob ein Polygon einen Kreis schneidet
 * @param {DCP.Polygon} poly das Polygon
 * @param {DCP.Circle} circle der Kreis
 * @returns {Boolean} true bei Schnitt, false sonst
 */
DCP.Polygon.kreisSchnitt = function (poly, circle) {
  if (poly instanceof DCP.Polygon && circle instanceof DCP.Circle) {
    /*
     * suchen der kuerzesten Verbindung der Ecken zum Mittelpunkt des Kreises
     */
    var verbindungsStrecke = Number.MAX_VALUE;
    var verbindungsvektor = null;
    for (var i = 0; i < poly.ortsvektoren.length; i++) {
      var tempVerbindungsVektor = DCP.Vektor2D.differenzVektor(poly.ortsvektoren[i], circle.ortsvektorMP);
      /*
       * nur die quadrierte Laenge betrachten denn es koennten sehr viele Achsen 
       * sein, das waeren sehr viele Wurzeloperationen.
       */
      var laengeQuadriert = tempVerbindungsVektor.getLaengeQuad();
      if (laengeQuadriert < verbindungsStrecke) {
        verbindungsStrecke = laengeQuadriert;
        verbindungsvektor = tempVerbindungsVektor;
      }
    }
    /*
     * hier hat man nun die minimale Verbindungstrecke und den Verbindungsvektor gefunden.
     * Berechne nun die Achse die es zu testen gilt und haenge sie an alle Polygonachsen an
     */
    var alleAchsen = poly.achsen;
    alleAchsen.push(verbindungsvektor.getNormalenEiheitsVektor());

    /*
     * for Schleife ueber alle Achsen
     */
    for (var i = 0; i < alleAchsen.length; i++) {
      /*
       * temporaere Variablen
       */
      var achse = alleAchsen[i];
      /*
       * die Variablen fuer die eindimensionalen Projektionen der Koerper auf
       * die Achse. Fuer die maximalen Werte wird die betragsgroesste Negative Zahl, 
       * und fuer die minimalen Werte die betragsgroesste positive Zahl gesetzt. 
       * Dies garantiert eine Zuweisung im ersten Durchlauf.
       */
      var maxProj1 = -Number.MAX_VALUE;
      var maxProj2 = -Number.MAX_VALUE;
      var minProj1 = Number.MAX_VALUE;
      var minProj2 = Number.MAX_VALUE;

      /*
       * Temporaere Variablen fuer die inneren Schleifendurchlaeufe.
       * Der ort speichert den aktuellen Ortsvektor.
       * Das Skalar den aktuellen Wert der Projektion auf dem (schon im Kontruktor) 
       * normierten Vektor der aktuellen Achse.
       */
      var ort;
      var skalar;

      //Projektion des Polygons
      for (var j = 0; j < poly.ortsvektoren.length; j++) {
        ort = poly.ortsvektoren[j];
        /*
         * hier versteckt sich direkt der Wert, der Projektion, da Achse normiert
         */
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj1) {
          maxProj1 = skalar;
        }
        if (skalar < minProj1) {
          minProj1 = skalar;
        }
      }
      //Projektion des Kreises
      ort = circle.ortsvektorMP;
      skalar = DCP.Vektor2D.skalarProdukt(ort, achse);
      /*
       * die Projektion eines Kreises enstpricht immer dem projeziertem Mittelpunkt +- dem radius
       */
      maxProj2 = skalar + circle.radius;
      minProj2 = skalar - circle.radius;

      /*
       * Testen der eindimensionalen strecken auf Schnitt. Wenn kein schnitt, dann raus
       * Die Polygone koennen sich nicht schneiden, wenn mindestens eine Trennungsachse gefunden wird!!!
       */
      if ((maxProj1 < minProj2) || (minProj1 > maxProj2)) {
        return false;
      }

    }
    /*
     * Achsendurchlauf Ende, und somit gibt es einen Schnitt der beiden Polygone
     */
    return true;
  }
  else {
    throw new Error("Es muss jeweils ein Polygon und ein Kreis uebergeben werden");
  }
};

DCP.Polygon.kreisKollision = function (poly, circle) {
  if (poly instanceof DCP.Polygon && circle instanceof DCP.Circle) {
    /*
     * Diese beiden Variablen benoetigt man um die beiden Polygone zu trennen.
     * Das trennungsSkalar ist der Wert den man aus dem Betrag der Ueberlappung
     * der Projektionen erhaelt. Der trennungsVektor ist der normierte Vektor, der 
     * mit dem trennungSkalar multipliziert wird. 
     */
    var trennungsSkalar = Number.MAX_VALUE;
    var trennungsVektor = null;
    
    /*
     * suchen der kuerzesten Verbindung der Ecken zum Mittelpunkt des Kreises
     */
    var verbindungsStrecke = Number.MAX_VALUE;
    var verbindungsvektor = null;
    for (var i = 0; i < poly.ortsvektoren.length; i++) {
      var tempVerbindungsVektor = DCP.Vektor2D.differenzVektor(poly.ortsvektoren[i], circle.ortsvektorMP);
      /*
       * nur die quadrierte Laenge betrachten denn es koennten sehr viele Achsen 
       * sein, das waeren sehr viele Wurzeloperationen.
       */
      var laengeQuadriert = tempVerbindungsVektor.getLaengeQuad();
      if (laengeQuadriert < verbindungsStrecke) {
        verbindungsStrecke = laengeQuadriert;
        verbindungsvektor = tempVerbindungsVektor;
      }
    }
    /*
     * hier hat man nun die minimale Verbindungstrecke und den Verbindungsvektor gefunden.
     * Berechne nun die Achse die es zu testen gilt und haenge sie an alle Polygonachsen an
     */
    var alleAchsen = poly.achsen;
    alleAchsen.push(verbindungsvektor.getNormalenEiheitsVektor());
    
    for (var i = 0; i < alleAchsen.length; i++) {
      var achse = alleAchsen[i];
      /*
       * die Variablen fuer die eindimensionalen Projektionen der Koerper auf
       * die Achse. Fuer die maximalen Werte wird die betragsgroesste Negative Zahl, 
       * und fuer die minimalen Werte die betragsgroesste positive Zahl gesetzt. 
       * Dies garantiert eine Zuweisung im ersten Durchlauf.
       */
      var maxProj1 = -Number.MAX_VALUE;
      var maxProj2 = -Number.MAX_VALUE;
      var minProj1 = Number.MAX_VALUE;
      var minProj2 = Number.MAX_VALUE;

      /*
       * Temporaere Variablen fuer die inneren Schleifendurchlaeufe.
       * Der ort speichert den aktuellen Ortsvektor.
       * Das Skalar den aktuellen Wert der Projektion auf dem (schon im Kontruktor) 
       * normierten Vektor der aktuellen Achse.
       */
      var ort;
      var skalar;

      //Projektion des ersten Polygons
      for (var j = 0; j < poly.ortsvektoren.length; j++) {
        ort = poly.ortsvektoren[j];
        /*
         * hier versteckt sich direkt der Wert, der Projektion, da Achse normiert
         */
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);

        if (skalar > maxProj1) {
          maxProj1 = skalar;
        }
        if (skalar < minProj1) {
          minProj1 = skalar;
        }
      }
      //Projektion des Kreises
      ort = circle.ortsvektorMP;
      skalar = DCP.Vektor2D.skalarProdukt(ort, achse);
      /*
       * die Projektion eines Kreises enstpricht immer dem projeziertem Mittelpunkt +- dem radius
       */
      maxProj2 = skalar + circle.radius;
      minProj2 = skalar - circle.radius;
      /*
       * Testen der eindimensionalen strecken auf Schnitt. Wenn kein schnitt, dann raus
       * Die Polygone koennen sich nicht schneiden, wenn mindestens eine Trennungsachse gefunden wird!!!
       */
      if ((maxProj2 < minProj1 && minProj2 < minProj1) || (minProj2 > maxProj1 && maxProj2 > maxProj1)) {
        /*
         * kein Schnitt, also raus bzw. return den NullVektor
         */
        return new DCP.Vektor2D(0, 0);
      }
      else {
        /*
         * Ansonsten gibt es einen Schnitt der eindimensionalen Projektionen
         * im aktuellen Durchlauf der Achsen.
         * Will man den Vektor ermitteln, mit dem man Polygon1 von Polygon2 trennt,
         * so muss man hier die Faelle betrachten, wo ein Schnitt eintritt.
         * Es gilt den kleinsten Wert zu finden, und ihn als trennungSkalar zusammen mit dem
         * trennungsVektor (einfach der aktuellen Achse) in den beiden Eingangs 
         * definierten globalen Variablen zwischenzuspeichern. 
         */
        var o = Number.MAX_VALUE;
        var u = Number.MAX_VALUE;
        var v = Number.MAX_VALUE;
        /*
         * Schnitt von links
         */
        if (maxProj1 > minProj2 && minProj1 < minProj2) {
          o = maxProj1 - minProj2;
        }
        /*
         * Schnitt von rechts
         */
        else if (maxProj1 > maxProj2 && minProj1 < maxProj2) {
          o = maxProj2 - minProj1;
        }
        /*
         *Proj1 ist enthalten in Proj2
         */
        else if (maxProj1 < maxProj2 && minProj1 > minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }
        /*
         * Proj1 enthaelt Proj2
         */
        else if (maxProj1 > maxProj2 && minProj1 < minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }

        if (o < trennungsSkalar) {
          trennungsSkalar = o;
          trennungsVektor = achse;

        }
      }

    }

    /*
     * der Vektor mittelPunktsBeziehung ist ein Vektor, der die beiden Mittelpunkte
     * (FussPunkt) Kreis und (Kopfpunkt) poly verbindet.
     * Seine Laenge ist der Abstand zwischen den beiden Mittelpunkten.
     * Seine Richtung ist die Richtung, die vom Kreis wegzeigt.
     */
    var mittelPunktsBeziehung = DCP.Vektor2D.differenzVektor(circle.ortsvektorMP, poly.getMittelpunkt());
    /*
     * Der TrennungsVektor muss vom Kreis wegzeigen, also genau dorthin wo der Vektor
     * mittelPunktsBeziehung zeigt. Nämlich hin zum Mittelpunkt von poly.
     * Das kann man mit dem Skalarprodukt beider Vektoren testen.
     * Wenn dies kleiner null ist passt man mit einer 
     * Skalarmultiplikation mit -1 den trennungsVektor einfach an.
     */
    if (DCP.Vektor2D.skalarProdukt(trennungsVektor, mittelPunktsBeziehung) < 0) {
      trennungsVektor.x *= -1;
      trennungsVektor.y *= -1;
    }

    /*
     * An diesem Punkt sind alle Achsen durchlaufen. Wir geben hier den mit dem
     * trennungsSkalar multiplizierten trennungsVektor zurueck. Dieser hat dann
     * genau die Richtung und die Laenge um das Polygon aus dem Kreis
     * herauszuschieben.
     * Kehrt man die Richtung des Vektors um und bewegt den Kreis, so schiebt man den Kreis
     * aus dem Polygon heraus.
     */
    return new DCP.Vektor2D(trennungsVektor.x * trennungsSkalar, trennungsVektor.y * trennungsSkalar);
  }
  else {
    throw new Error("Es muessen zwei Polygone an die Funktion kollision uebergeben werden");
  }
};

DCP.Polygon.polyVsKreis = function (poly, circle) {
  if (poly instanceof DCP.Polygon && circle instanceof DCP.Circle) {
    /*
     * Diese beiden Variablen benoetigt man um die beiden Polygone zu trennen.
     * Das trennungsSkalar ist der Wert den man aus dem Betrag der Ueberlappung
     * der Projektionen erhaelt. Der trennungsVektor ist der normierte Vektor, der 
     * mit dem trennungSkalar multipliziert wird. 
     */
    var trennungsSkalar = Number.MAX_VALUE;
    //var trennungsVektor = new DCP.Vektor2D(0, 0);
    var trennungsVektor = null;
    
    /*
     * suchen der kuerzesten Verbindung der Ecken zum Mittelpunkt des Kreises
     */
    var verbindungsStrecke = Number.MAX_VALUE;
    //var verbindungsvektor = DCP.Vektor2D.differenzVektor(poly.ortsvektoren[0], circle.ortsvektorMP);
    var verbindungsvektor = null;
    for (var i = 0; i < poly.ortsvektoren.length; i++) {
      var tempVerbindungsVektor = DCP.Vektor2D.differenzVektor(poly.ortsvektoren[i], circle.ortsvektorMP);
      /*
       * nur die quadrierte Laenge betrachten denn es koennten sehr viele Achsen 
       * sein, das waeren sehr viele Wurzeloperationen.
       */
      var laengeQuadriert = tempVerbindungsVektor.getLaengeQuad();
      if (laengeQuadriert < verbindungsStrecke) {
        verbindungsStrecke = laengeQuadriert;
        verbindungsvektor = tempVerbindungsVektor;
      }
    }
    /*
     * hier hat man nun die minimale Verbindungstrecke und den Verbindungsvektor gefunden.
     * Berechne nun die Achse die es zu testen gilt und haenge sie an alle Polygonachsen an
     */
    var alleAchsen = poly.achsen;
    alleAchsen.push(verbindungsvektor.getNormalenEiheitsVektor());
    
    for (var i = 0; i < alleAchsen.length; i++) {
      var achse = alleAchsen[i];
      /*
       * die Variablen fuer die eindimensionalen Projektionen der Koerper auf
       * die Achse. Fuer die maximalen Werte wird die betragsgroesste Negative Zahl, 
       * und fuer die minimalen Werte die betragsgroesste positive Zahl gesetzt. 
       * Dies garantiert eine Zuweisung im ersten Durchlauf.
       */
      var maxProj1 = -Number.MAX_VALUE;
      var maxProj2 = -Number.MAX_VALUE;
      var minProj1 = Number.MAX_VALUE;
      var minProj2 = Number.MAX_VALUE;

      /*
       * Temporaere Variablen fuer die inneren Schleifendurchlaeufe.
       * Der ort speichert den aktuellen Ortsvektor.
       * Das Skalar den aktuellen Wert der Projektion auf dem (schon im Kontruktor) 
       * normierten Vektor der aktuellen Achse.
       */
      var ort;
      var skalar;

      //Projektion des ersten Polygons
      for (var j = 0; j < poly.ortsvektoren.length; j++) {
        ort = poly.ortsvektoren[j];
        /*
         * hier versteckt sich direkt der Wert, der Projektion, da Achse normiert
         */
        skalar = DCP.Vektor2D.skalarProdukt(ort, achse);
        
        if (skalar > maxProj1) {
          maxProj1 = skalar;
        }
        if (skalar < minProj1) {
          minProj1 = skalar;
        }
        
      }
      //Projektion des Kreises
      ort = circle.ortsvektorMP;
      skalar = DCP.Vektor2D.skalarProdukt(ort, achse);
      /*
       * die Projektion eines Kreises enstpricht immer dem projeziertem Mittelpunkt +- dem radius
       */
      maxProj2 = skalar + circle.radius;
      minProj2 = skalar - circle.radius;
      /*
       * Testen der eindimensionalen strecken auf Schnitt. Wenn kein schnitt, dann raus
       * Die Polygone koennen sich nicht schneiden, wenn mindestens eine Trennungsachse gefunden wird!!!
       */
      if ((maxProj2 < minProj1 && minProj2 < minProj1) || (minProj2 > maxProj1 && maxProj2 > maxProj1)) {
        /*
         * kein Schnitt, also raus bzw. return den NullVektor
         */
        return {
          skalar: 0,
          achsen: new DCP.Vektor2D(0, 0)
        };
      }
      else {
        /*
         * Ansonsten gibt es einen Schnitt der eindimensionalen Projektionen
         * im aktuellen Durchlauf der Achsen.
         * Will man den Vektor ermitteln, mit dem man Polygon1 von Polygon2 trennt,
         * so muss man hier die Faelle betrachten, wo ein Schnitt eintritt.
         * Es gilt den kleinsten Wert zu finden, und ihn als trennungSkalar zusammen mit dem
         * trennungsVektor (einfach der aktuellen Achse) in den beiden Eingangs 
         * definierten globalen Variablen zwischenzuspeichern. 
         */
        var o = Number.MAX_VALUE;
        var u = Number.MAX_VALUE;
        var v = Number.MAX_VALUE;
        /*
         * Schnitt von links
         */
        if (maxProj1 > minProj2 && minProj1 < minProj2) {
          o = maxProj1 - minProj2;
        }
        /*
         * Schnitt von rechts
         */
        else if (maxProj1 > maxProj2 && minProj1 < maxProj2) {
          o = maxProj2 - minProj1;
        }
        /*
         *Proj1 ist enthalten in Proj2
         */
        else if (maxProj1 < maxProj2 && minProj1 > minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }
        /*
         * Proj1 enthaelt Proj2
         */
        else if (maxProj1 > maxProj2 && minProj1 < minProj2) {
          u = maxProj1 - minProj2;
          v = maxProj2 - minProj1;
          o = (u < v) ? u : v;
        }

        if (o < trennungsSkalar) {
          trennungsSkalar = o;
          trennungsVektor = achse;

        }
      }

    }
    return {
      skalar: trennungsSkalar,
      achse: trennungsVektor
    };
    
  }
  else {
    throw new Error("Es muessen zwei Polygone an die Funktion kollision uebergeben werden");
  }
};

/**
 * Macht den uebergeben canvas context sauber, fuellt also mit DCP.BG_COLOR
 * @param {CanvasRenderingContext2D} context
 */
DCP.Polygon.cleanCanvas = function (context) {
  if (context instanceof  CanvasRenderingContext2D) {
    /*
     * Leinwand mit der Hintergrundfarbe bemalen
     */
    context.fillStyle = DCP.Colors.BG_COLOR;
    context.fillRect(0, 0, DCP.Measures.CAN_WIDTH, DCP.Measures.CAN_HEIGHT);
  }
};