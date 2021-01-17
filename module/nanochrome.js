import { nanochrome } from "./config.js"
import { registerHelpers } from "./helpers.js";
import { preloadHandlebarsTemplates } from "./templates.js"
import NanoItemSheet from "./sheets/NanoItemSheet.js";
import NanoActorSheet from "./sheets/NanoActorSheet.js"
import NanoActor from "./NanoActor.js"

Hooks.once("init",function(){
    console.log("Nanochrome | Initialisation du système Nanochrome");

    CONFIG.nanochrome = nanochrome;
    //CONFIG.debug.hooks = true;
    CONFIG.Actor.entityClass = NanoActor;

    CONFIG.Combat.initiative = {
        formula: "3d6 + @initiative",
        decimals: 0
    };

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("nanochrome",NanoItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("nanochrome",NanoActorSheet, { makeDefault: true });

    registerHelpers();
    preloadHandlebarsTemplates();
})