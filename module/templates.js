/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */


export const preloadHandlebarsTemplates = async function () {

    // Define template paths to load
    const templatePaths = [
        "systems/nanochrome/templates/sheets/partials/liste-armes.hbs",
        "systems/nanochrome/templates/sheets/partials/liste-protections.hbs",
        "systems/nanochrome/templates/sheets/partials/liste-cybernetique.hbs",
        "systems/nanochrome/templates/sheets/partials/caracteristiques.hbs",
        "systems/nanochrome/templates/sheets/partials/points-de-vie.hbs",
        "systems/nanochrome/templates/sheets/partials/profil.hbs",
        "systems/nanochrome/templates/sheets/partials/risques-et-prouesses.hbs",
        "systems/nanochrome/templates/sheets/partials/connexion.hbs",
        "systems/nanochrome/templates/sheets/partials/initiative.hbs",
        "systems/nanochrome/templates/sheets/partials/defense.hbs",
        "systems/nanochrome/templates/sheets/partials/nexus.hbs",
        "systems/nanochrome/templates/sheets/partials/chance.hbs",
        "systems/nanochrome/templates/sheets/partials/competences.hbs",
        "systems/nanochrome/templates/sheets/partials/capacites.hbs",
        "systems/nanochrome/templates/sheets/partials/yens.hbs"
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
