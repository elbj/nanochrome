export default class NanoActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;
    actorData.config = CONFIG.nanochrome;

    console.log("Data:");
    console.log(data);

    switch (actorData.type) {
      case 'personnage':
        this._preparePersonnageData(actorData);
        break;
      case 'pnj':
        this._preparePnJData(actorData);
        break;
      default:
        break;
    }
  }

  _preparePnJData(actorData) {
    const character = actorData.data;    

    this.initializeInitiative(character.bonusinitiative, character);
    this.initializeArmes(actorData, character, character.corpsacorps.bonusattaque, character.corpsacorps.bonusdegats, character.distance.bonusattaque, character.distance.bonusdegats);
    this.initializeProtections(actorData, character);
    this.initializeCybernetique(actorData, character);
  }

  /**
   * Prepare Character type specific data
   */
  _preparePersonnageData(actorData) {
    const character = actorData.data;

    for (var nom in character.caracteristiques) {
      var caracteristique = character.caracteristiques[nom];
      caracteristique.nom = actorData.config.caracteristiques[nom];
    }

    var force = character.caracteristiques["force"].valeur;
    var dexterite = character.caracteristiques["dexterite"].valeur;
    var constitution = character.caracteristiques["constitution"].valeur;
    var sagesse = character.caracteristiques["sagesse"].valeur;
    var intelligence = character.caracteristiques["intelligence"].valeur;
    var charisme = character.caracteristiques["charisme"].valeur;

    this.initializeInitiative(intelligence, character);
    this.initializeArmes(actorData, character, force, force, dexterite, dexterite);
    this.initializeProtections(actorData, character);
    this.initializeCapacites(actorData, character);
    this.initializeCompetences(actorData, character);
    this.initializeCybernetique(actorData, character);
    this.initializeEquipement(actorData, character);
    this.initializeDefense(character, sagesse, character.defense.bonus.cyber + character.defense.bonus.capacite);
    this.initializeConnexion(character, intelligence, character.connexion.bonus.nexus + character.connexion.bonus.cyber + character.connexion.bonus.capacite)
    this.initializeChance(character, charisme, character.chance.bonus.capacite);
    this.initializePointsDeVieEtBlessures(character, constitution, character.pointsdevie.bonus.cyber + character.pointsdevie.bonus.capacite)
  }

  initializeInitiative(valeur, character) {
    character.initiative = valeur;
  }

  initializeCapacites(actorData, character) {
    character.capacites = actorData.items.filter((item => { return item.type === "capacite" }));
  }

  initializeCompetences(actorData, character) {
    character.competences = actorData.items.filter((item => { return item.type === "competence" }));
  }

  initializeCybernetique(actorData, character) {
    character.cybernetique = actorData.items.filter((item => { return item.type === "cybernetique" }));

    character.cybernetique.forEach((cyber) => {
      var cyberTypeName = this.getOptionTypeKeyFromName(cyber.name);
      cyber.options = actorData.items.filter((item => { return (item.type === "option" && item.data.type === cyberTypeName) }));
    });
  }

  initializeEquipement(actorData, character) {
    character.equipement = actorData.items.filter((item => { return item.type === "equipement" }));
  }

  initializeArmes(actorData, character, attaqueCorpsaCorps, bonusDegatsCorpsaCorps, attaqueDistance, bonusDegatsDistance) {
    character.armes = actorData.items.filter((item => { return item.type === "arme" }));
    character.armes.forEach((arme) => {
      if (arme.data.type === "armedecorpsacorps") {
        arme.data.attaque = attaqueCorpsaCorps;
        arme.data.degatsTotaux = arme.data.degats + bonusDegatsCorpsaCorps;
      }
      else {
        arme.data.attaque = attaqueDistance;
        arme.data.degatsTotaux = arme.data.degats + bonusDegatsDistance;
      }

      arme.data.options = actorData.items.filter((item => {
        return (item.type === "option"
          && item.data.type === arme.data.type
          && item.data.affectation === arme._id)
      }));
    })
  }

  initializeProtections(actorData, character) {
    character.protections = actorData.items.filter((item => { return item.type === "protection" }));
    character.protections.forEach((protection) => {
      protection.data.options = actorData.items.filter((item => {
        return (item.type === "option"
          && item.data.affectation === protection._id)
      }));
    })
  }

  initializeDefense(character, base, bonus) {
    var protection = 0;
    character.protections.forEach((prot) => {
      if(prot.data.estPortee){
        protection += prot.data.protection;
      }
    })
    character.defense.protection = protection;
    character.defense.valeur = 7 + base + protection + bonus;
  }

  initializeConnexion(character, base, bonus) {
    character.connexion.max = base + bonus;
  }

  initializeChance(character, base, bonus) {
    character.chance.max = base + bonus;
  }

  initializePointsDeVieEtBlessures(character, base, bonus) {
    var pointsdevie = 5 + 5 * base + bonus;
    character.pointsdevie.max = pointsdevie - 5 * character.blessures.actuel;
    character.blessures.max = pointsdevie / 5;
  }

  getOptionTypeKeyFromName(optionTypeName) {
    for (var optionType in CONFIG.nanochrome.optionTypes) {
      if (CONFIG.nanochrome.optionTypes[optionType] === optionTypeName) {
        return optionType;
      }
    }
    return null;
  }

}