import { nanochrome } from "./config.js"
import NanoItemSheet from "./sheets/NanoItemSheet.js";

Hooks.once("init",function(){
    console.log("Nanochrome | Initialisation du système Nanochrome");

    CONFIG.nanochrome = nanochrome;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("nanochrome",NanoItemSheet, { makeDefault: true });
})