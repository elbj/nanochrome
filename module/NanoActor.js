export default class NanoActor extends Actor {

    /**
     * Augment the basic actor data with additional dynamic data.
     */
    prepareData() {
      super.prepareData();
  
      const actorData = this.data;
      const data = actorData.data;
      const flags = actorData.flags;
  
      // Make separate methods for each Actor type (character, npc, etc.) to keep
      // things organized.
      if (actorData.type === 'personnage') this._prepareCharacterData(actorData);
    }
  
    /**
     * Prepare Character type specific data
     */
    _prepareCharacterData(actorData) {
      const character = actorData.data;
  
      character.initiative = character.caracteristiques.intelligence.valeur;
    }
  
  }