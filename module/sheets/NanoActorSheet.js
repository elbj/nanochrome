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

        for (var nom in character.caracteristiques) {
            var caracteristique = character.caracteristiques[nom];
            caracteristique.nom = data.config.caracteristiques[nom];
        }

        var force = character.caracteristiques["force"].valeur;
        var dexterite = character.caracteristiques["dexterite"].valeur;
        var constitution = character.caracteristiques["constitution"].valeur;
        var sagesse = character.caracteristiques["sagesse"].valeur;
        var intelligence = character.caracteristiques["intelligence"].valeur;
        var charisme = character.caracteristiques["charisme"].valeur;

        character.armes = data.items.filter((item => { return item.type === "arme" }));
        character.armes.forEach((arme) => {
            if (arme.data.type === "armedecorpsacorps") {
                arme.data.attaque = force;
                arme.data.degatsTotaux = arme.data.degats + force;
            }
            else {
                arme.data.attaque = dexterite;
                arme.data.degatsTotaux = arme.data.degats + dexterite;
            }

            arme.data.options = data.items.filter((item => {
                return (item.type === "option"
                    && item.data.type === arme.data.type
                    && item.data.affectation === arme._id)
            }));
        })

        character.protections = data.items.filter((item => { return item.type === "protection" }));
        character.capacites = data.items.filter((item => { return item.type === "capacite" }));
        character.equipement = data.items.filter((item => { return item.type === "equipement" }));
        character.cybernetique = data.items.filter((item => { return item.type === "cybernetique" }));

        character.cybernetique.forEach((cyber) => {
            var cyberTypeName = this.getOptionTypeKeyFromName(cyber.name);
            cyber.options = data.items.filter((item => { return (item.type === "option" && item.data.type === cyberTypeName) }));
        });

        character.protections.forEach((cyber) => {
            cyber.options = data.items.filter((item => { return (item.type === "option" && item.data.type === cyber.type) }));
        });

        var protection = 0;
        character.protections.forEach((prot) => {
            protection += prot.data.protection;
        })
        character.defense.protection = protection;
        character.defense.valeur = 7 + sagesse + protection + character.defense.bonus.cyber + character.defense.bonus.capacite;

        character.connexion.max = intelligence + character.connexion.bonus.nexus + character.connexion.bonus.cyber + character.connexion.bonus.capacite;
        character.chance.max = charisme + character.chance.bonus.capacite;

        var pointsdevie = 5 + 5 * constitution + character.pointsdevie.bonus.cyber + character.pointsdevie.bonus.capacite;
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
                    if (actorItem.data.type === "protection") {
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
            content: "<input type='Number' id='mod' name='mod' value='0'/>",
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
                    if (this.actor.data.items.find(item => item.type === "protection") == undefined) {
                        throw new Error("Vous devez porter une protection pour pouvoir acquérir cette option.")
                    }
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

    getOptionTypeKeyFromName(optionTypeName) {
        for (var optionType in CONFIG.nanochrome.optionTypes) {
            if (CONFIG.nanochrome.optionTypes[optionType] === optionTypeName) {
                return optionType;
            }
        }
        return null;
    }
}