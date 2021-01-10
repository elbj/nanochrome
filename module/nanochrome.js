import { nanochrome } from "./config.js"
import { registerHelpers } from "./helpers.js";
import { preloadHandlebarsTemplates } from "./templates.js"
import NanoItemSheet from "./sheets/NanoItemSheet.js";
import NanoActorSheet from "./sheets/NanoActorSheet.js"

Hooks.once("init",function(){
    console.log("Nanochrome | Initialisation du système Nanochrome");

    CONFIG.nanochrome = nanochrome;
    //CONFIG.debug.hooks = true;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("nanochrome",NanoItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("nanochrome",NanoActorSheet, { makeDefault: true });

    registerHelpers();
    preloadHandlebarsTemplates();
})