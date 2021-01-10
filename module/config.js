export const nanochrome = {};

nanochrome.armeTypes = {
    armedecorpsacorps: "Arme de corps à corps",
    armeafeu: "Arme à feu"
}

nanochrome.risquesprouesses = [
    {
        "id":1,
        "prouesse":{
            "nom":"Cascade",
            "description":"(action + manoeuvre)"
        },
        "risque":{
            "nom":"Coup dévié",
            "description":"(dégâts sans dés)"
        }
    },
    {
        "id":2,
        "prouesse":{
            "nom":"Coup précis",
            "description":"(attaque +2)"
        },
        "risque":{
            "nom":"En danger",
            "description":"(défense -1)"
        }
    },
    {
        "id":3,
        "prouesse":{
            "nom":"Coup violent",
            "description":"(dégâts +1d6)"
        },
        "risque":{
            "nom":"Gêne",
            "description":"(attaque -2 ou -1 conn)"
        }
    },
    {
        "id":4,
        "prouesse":{
            "nom":"Prudence",
            "description":"(défense +1)"
        },
        "risque":{
            "nom":"Maladresse",
            "description":"(si action ratée)"
        }
    },
    {
        "id":5,
        "prouesse":{
            "nom":"Tactique",
            "description":"(+2 à un allié)"
        },
        "risque":{
            "nom":"Temporisation",
            "description":"(Initiative -1d6)"
        }
    },
    {
        "id":6,
        "prouesse":{
            "nom":"Vivacité",
            "description":"(Initiative +1d6)"
        },
        "risque":{
            "nom":"Aucun",
            "description":"(pas de risque)"
        }
    }
]