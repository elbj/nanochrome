export default class NanoActorSheet extends ActorSheet{

    get template(){
        console.log("Nanochrome | Loading " + this.actor.data.type);
        return `systems/nanochrome/templates/sheets/${this.actor.data.type}-sheet.html`;
    }

    getData(){
        const data = super.getData();

        data.config = CONFIG.nanochrome;

        console.log(data);

        return data;
    }
}