export default class NanoActorSheet extends ActorSheet {
/*
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          classes: ["nanochrome", "sheet", "actor"],
          template: "systems/nanochrome/templates/sheets/personnage-sheet.html",
          width: 600,
          height: 600,
          tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "tab1" }]
        });
      }
*/
    get template() {
        console.log("Nanochrome | Loading " + this.actor.data.type);
        return `systems/nanochrome/templates/sheets/${this.actor.data.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.nanochrome;        
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
            let d = Dialog.confirm({
                title: "Suppression d'élément",
                content: "<p>Confirmer la suppression de '" + item.name + "'.</p>",
                yes: () => this.deleteItem(item),
                no: () => { },
                defaultYes: false
            });
        });

        html.find('.roll-prouesse').click(ev => {
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
            ChatLog.postOne(message, true);
        });

        html.find('.roll-attaque').click(ev => {
            const arme = ev.currentTarget.dataset["arme"];
            let attaque = Number(ev.currentTarget.dataset["attaque"]);
            let degats = Number(ev.currentTarget.dataset["degats"]);
            this.askForRollModifier(modif => {
                let d6Roll = new Roll("2d6 + 1d6x6 + " + modif);
                d6Roll.evaluate();
                attaque += d6Roll.total;
                degats += d6Roll.dice[1].total;
                d6Roll.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: `Attaque avec ${arme} : ${attaque} => ${degats}.`
                });
            });
        });

        html.find('.roll-caracteristique').click(ev => {
            const nom = ev.currentTarget.dataset["nom"];
            const valeur = ev.currentTarget.dataset["valeur"];
            this.askForRollModifier(modif => {
                let d6Roll = new Roll("2d6 + 1d6 +" + valeur + " + " + modif);
                d6Roll.evaluate();
                d6Roll.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: this.actor }),
                    flavor: `Teste ${nom}.`
                });
            });
        });

        html.find('.blessureLevel').click(ev => {
            let level = Number(ev.currentTarget.dataset["valeur"]);
            this.actor.update({ "data.blessures.actuel": level });
            this.actor.sheet.render(true);
        });

        html.find('.checkboxClick').click(ev => {
            const item = this.getItemFromEvent(ev);
            const update = {_id: item._id, data : { estPortee : !item.data.data.estPortee}};
            this.actor.updateEmbeddedEntity("OwnedItem", update);
            this.actor.sheet.render(true);
        });
    }

    deleteItem(item) {
        switch (item.type) {
            case "arme":
                this.actor.items.forEach(actorItem => {
                    if (actorItem.data.data.affectation === item.id) {
                        this.deleteItem(actorItem);
                    }
                })
                break;
            case "protection":
                this.actor.items.forEach(actorItem => {
                    if (actorItem.data.data.affectation === item.id) {
                        this.deleteItem(actorItem);
                    }
                })
                break;
            case "cybernetique":
                var options = this.actor.items.filter(itemData => itemData.data.type === "option" && itemData.data.data.type === item.data.data.type);
                options.forEach(option => {
                    this.deleteItem(option);
                })
                break;
            default:
                break;
        }
        this.actor.deleteOwnedItem(item._id);
    }

    askForRollModifier(callback) {
        return new Dialog({
            title: "Modificateur",
            content: "<label>Modificateur : </label><input type='Number' id='mod' name='mod' value='0'/></label>",
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Ok",
                    callback: (html) => {
                        var modif = html.find('#mod').val();
                        callback(modif)
                    }
                }
            },
            default: "ok",
            render: html => { },
            close: html => { }
        }).render(true);
    }

    async _onDropItem(event, data) {
        if (!this.actor.owner) return false;
        const item = await Item.fromDropData(data);
        const itemData = duplicate(item.data);

        if (itemData.type === "option") {
            this._onDropItemOption(event, itemData, data.actorId, data.tokenId);
        }
        else {
            this.finalizeDropItem(event, itemData, data.actorId, data.tokenId);
        }
    }

    finalizeDropItem(event, itemData, actorId, tokenId) {
        // Handle item sorting within the same Actor
        const actor = this.actor;
        let sameActor = (actorId === actor._id) || (actor.isToken && (tokenId === actor.token.id));
        if (sameActor) return this._onSortItem(event, itemData);
        // Create the owned item
        return this._onDropItemCreate(itemData);
    }

    async _onDropItemOption(event, itemData, actorId, tokenId) {
        console.log(this.actor);
        console.log(itemData);
        try {
            switch (itemData.data.type) {
                case "armeafeu":
                case "armedecorpsacorps":
                    var armes = this.actor.data.items.filter(item => item.type === "arme" && item.data.type === itemData.data.type);
                    if (armes.length === 0) {
                        throw new Error("Vous devez avoir une " + CONFIG.nanochrome.armeTypes[itemData.data.type] + " pour pouvoir lui affecter celle-ci.")
                    }

                    await this.affectContainer(armes, itemData);

                    break;
                case "protection":
                    var protections = this.actor.data.items.filter(item => item.type === "protection");
                    if (protections.length === 0) {
                        throw new Error("Vous devez porter une protection pour pouvoir acquérir cette option.")
                    }
                    await this.affectContainer(protections, itemData);
                    break;
                case "neuronique":
                case "nanogenetique":
                case "panoptique":
                case "prosthetique":
                case "renforcements":
                    if (this.actor.data.items.find(item => item.type === "cybernetique" && item.data.type === itemData.data.type) == undefined) {
                        throw new Error("Vous devez avoir une cybernetique de type '" + itemData.data.type + "' installée pour pouvoir acquérir cette option.")
                    }
                    break;
                default:
                    return false;
            }

            this.finalizeDropItem(event, itemData, actorId, tokenId);
        }
        catch (err) {
            ui.notifications.error(err);
            return false;
        }
    }

    async affectContainer(containers, item) {
        return new Promise((resolve, reject) => {
            var options = {};
            containers.forEach(element => {
                options[element._id] = {
                    icon: '<i class="fas fa-check"></i>',
                    label: element.name,
                    callback: () => item.data.affectation = element._id
                }
            });
            let d = new Dialog({
                title: "Sélectionner l'arme",
                content: "<p>Merci de sélectionner l'arme à laquelle vous souhaitez affecter l'option.</p>",
                buttons: options,
                default: "two",
                render: html => { },
                close: html => { resolve() }
            });
            d.render(true)
        });
    }

    getItemFromEvent = (ev) => {
        const parent = $(ev.currentTarget).parents(".item");
        return this.actor.getOwnedItem(parent.data("itemId"));
    }
}