import { nanochrome } from "./config.js"
import NanoItemSheet from "./sheets/NanoItemSheet.js";
import NanoActorSheet from "./sheets/NanoActorSheet.js"

Hooks.once("init",function(){
    console.log("Nanochrome | Initialisation du système Nanochrome");

    CONFIG.nanochrome = nanochrome;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("nanochrome",NanoItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("nanochrome",NanoActorSheet, { makeDefault: true });
})