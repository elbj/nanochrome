export default class NanoActorSheet extends ActorSheet {

    get template() {
        console.log("Nanochrome | Loading " + this.actor.data.type);
        return `systems/nanochrome/templates/sheets/${this.actor.data.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.nanochrome;

        console.log(data);

        const character = data.data;

        character.armes = data.items.filter((item => { return item.type === "arme" }));
        character.armes.forEach((arme) => {
            if(arme.data.type === "armedecorpsacorps"){
                arme.data.attaque = character.caracteristiques.force;
                arme.data.degatsTotaux = arme.data.degats + character.caracteristiques.force;
            }
            else{
                arme.data.attaque = character.caracteristiques.dexterite;
                arme.data.degatsTotaux = arme.data.degats + character.caracteristiques.dexterite;
            }
        })

        character.protections = data.items.filter((item => { return item.type === "protection" }));

        var protection = 0;
        character.protections.forEach((prot) => {
            protection += prot.data.protection;
        })
        character.protection = protection;
        character.defense = 7 + character.caracteristiques.sagesse + protection;

        var pointsdevie = 5 + 5 * character.caracteristiques.constitution;
        character.pointsdevie.max = pointsdevie - 5 * character.blessures.actuel;
        character.blessures.max = pointsdevie / 5;
        return data;
    }

    activateListeners(html) {
        console.log("Nanochrome | Activate actor listeners");
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Update Inventory Item
        html.find('.item-edit').click(ev => {
            const item = this.getItemFromEvent(ev);
            item.sheet.render(true);
        });

        // Delete Inventory Item
        html.find('.item-delete').click(ev => {
            const item = this.getItemFromEvent(ev);
            this.actor.deleteOwnedItem(item._id);
        });

        html.find('.roll-prouesse').click(ev =>{
            const prouesseId = ev.currentTarget.dataset["prouesseId"];
            const prouesse = CONFIG.nanochrome.risquesprouesses.find(element => element.id == prouesseId).prouesse;
            let d6Roll = new Roll("1d6");
            d6Roll.evaluate();
            const risqueId = d6Roll.total;
            const risque = CONFIG.nanochrome.risquesprouesses.find(element => element.id == risqueId).risque;
            const message = ChatMessage.create({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                content: `Tente la prouesse ${prouesse.nom} mais prend le risque ${risque.nom}.`
            })
            ChatLog.postOne(message,true);
        });

        html.find('.roll-attaque').click(ev =>{
            const arme = ev.currentTarget.dataset["arme"];
            let attaque = Number(ev.currentTarget.dataset["attaque"]);
            let degats = Number(ev.currentTarget.dataset["degats"]);
            let d6Roll = new Roll("2d6 + 1d6x6");
            d6Roll.evaluate();
            attaque += d6Roll.total;
            degats += d6Roll.dice[1].total;
            d6Roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `Attaque avec ${arme} : ${attaque} => ${degats}.`
            });
        });

        html.find('.roll-caracteristique').click(ev =>{
            const nom = ev.currentTarget.dataset["nom"];
            const valeur = ev.currentTarget.dataset["valeur"];
            let d6Roll = new Roll("2d6 + 1d6 +" + valeur);
            d6Roll.evaluate();
            d6Roll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                flavor: `Teste ${nom}.`
            });
        });

        html.find('.blessureLevel').click(ev => {
            let level = Number(ev.currentTarget.dataset["valeur"]);
            this.actor.update({ "data.blessures.actuel": level });
            this.actor.sheet.render(true);
        });
    }

    getItemFromEvent = (ev) => {
        const parent = $(ev.currentTarget).parents(".item");
        return this.actor.getOwnedItem(parent.data("itemId"));
    }
}