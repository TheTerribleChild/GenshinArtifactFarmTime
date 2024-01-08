"use strict";
window.onload = () => {
    console.log("Page loaded");
    let runSimulationButton = document.getElementById("runSimulation");
    if (runSimulationButton) {
        runSimulationButton.addEventListener("click", runSimulation);
    }
};
function runSimulation() {
    let formulaInput = document.getElementById("formula");
    let minmumERInput = document.getElementById("er");
    let runsInput = document.getElementById("runs");
    let formula = formulaInput.value;
    let maxRuns = runsInput.value == "" ? 100 : Number(runsInput.value);
    let minmumER = minmumERInput.value == "" ? 0 : Number(minmumERInput.value);
    let result = new Map();
    let usefulStats = getUsefulStats(formula, minmumER);
    for (let runs = 50; runs <= maxRuns; runs += 50) {
        result.set(runs, []);
        for (let trial = 0; trial < 1; trial++) {
            let resultSet = generateMaxArtifactSet(runs, formula, minmumER, usefulStats);
            result.get(runs).push(resultSet == null ? 0 : resultSet.dmg);
        }
        console.log("Runs: " + runs);
    }
    document.getElementById('artifactTextBox').value = resultToString(result);
}
function resultToString(result) {
    let output = "";
    result.forEach((value, key) => {
        output += key + " ";
        output += value.reduce((a, b) => a + b, 0) / value.length + "\n";
    });
    return output;
}
var ArtifactType;
(function (ArtifactType) {
    ArtifactType["Flower"] = "Flower";
    ArtifactType["Plume"] = "Plume";
    ArtifactType["Sands"] = "Sands";
    ArtifactType["Goblet"] = "Goblet";
    ArtifactType["Circlet"] = "Circlet";
})(ArtifactType || (ArtifactType = {}));
var Stat;
(function (Stat) {
    Stat["HP_PERC"] = "HP%";
    Stat["ATK_PERC"] = "ATK%";
    Stat["DEF_PERC"] = "DEF%";
    Stat["PYRO_DMG"] = "PYRO_DMG";
    Stat["HYDRO_DMG"] = "HYDRO_DMG";
    Stat["CRYO_DMG"] = "CRYO_DMG";
    Stat["ELECTRO_DMG"] = "ELECTRO_DMG";
    Stat["ANEMO_DMG"] = "ANEMO_DMG";
    Stat["GEO_DMG"] = "GEO_DMG";
    Stat["DENDRO_DMG"] = "DENDRO_DMG";
    Stat["PHYS_DMG"] = "PHYS_DMG";
    Stat["HP"] = "HP";
    Stat["ATK"] = "ATK";
    Stat["DEF"] = "DEF";
    Stat["ER"] = "ER";
    Stat["EM"] = "EM";
    Stat["CR"] = "CR";
    Stat["CD"] = "CD";
})(Stat || (Stat = {}));
const statsInOrder = [
    Stat.HP_PERC,
    Stat.ATK_PERC,
    Stat.DEF_PERC,
    Stat.PYRO_DMG,
    Stat.HYDRO_DMG,
    Stat.CRYO_DMG,
    Stat.ELECTRO_DMG,
    Stat.ANEMO_DMG,
    Stat.GEO_DMG,
    Stat.DENDRO_DMG,
    Stat.PHYS_DMG,
    Stat.HP,
    Stat.ATK,
    Stat.DEF,
    Stat.ER,
    Stat.EM,
    Stat.CR,
    Stat.CD,
];
const MAX_MAIN_STAT = new Map();
MAX_MAIN_STAT.set(Stat.HP, 4780);
MAX_MAIN_STAT.set(Stat.HP_PERC, .466);
MAX_MAIN_STAT.set(Stat.ATK, 311);
MAX_MAIN_STAT.set(Stat.ATK_PERC, .466);
MAX_MAIN_STAT.set(Stat.DEF_PERC, .466);
MAX_MAIN_STAT.set(Stat.ER, .518);
MAX_MAIN_STAT.set(Stat.EM, 187);
MAX_MAIN_STAT.set(Stat.CR, .311);
MAX_MAIN_STAT.set(Stat.CD, .622);
MAX_MAIN_STAT.set(Stat.PYRO_DMG, .466);
MAX_MAIN_STAT.set(Stat.HYDRO_DMG, .466);
MAX_MAIN_STAT.set(Stat.CRYO_DMG, .466);
MAX_MAIN_STAT.set(Stat.ELECTRO_DMG, .466);
MAX_MAIN_STAT.set(Stat.ANEMO_DMG, .466);
MAX_MAIN_STAT.set(Stat.GEO_DMG, .466);
MAX_MAIN_STAT.set(Stat.DENDRO_DMG, .466);
MAX_MAIN_STAT.set(Stat.PHYS_DMG, .583);
class Artifact {
    constructor(type) {
        this.usefulStats = 0;
        this.type = type;
        this.stats = new Map();
    }
}
class SortedArtifactList {
    constructor() {
        this.artifacts = [];
    }
    insert(artifact) {
        this.artifacts.push(artifact);
        this.artifacts.sort((a, b) => (b.usefulStats || 0) - (a.usefulStats || 0));
    }
    getArtifacts() {
        return this.artifacts;
    }
    removeLowestIfFull() {
        if (this.artifacts.length > 10) {
            this.artifacts.pop();
            return true;
        }
        return false;
    }
}
class ArtifactSet {
    constructor(flower, plume, sands, goblet, circlet) {
        this.stats = new Map();
        this.flower = flower;
        this.plume = plume;
        this.sands = sands;
        this.goblet = goblet;
        this.circlet = circlet;
        this.dmg = 0;
    }
    sumArtifactStats() {
        this.flower.stats.forEach((value, key) => {
            this.stats.set(key, (this.stats.get(key) || 0) + value);
        });
        this.plume.stats.forEach((value, key) => {
            this.stats.set(key, (this.stats.get(key) || 0) + value);
        });
        this.sands.stats.forEach((value, key) => {
            this.stats.set(key, (this.stats.get(key) || 0) + value);
        });
        this.goblet.stats.forEach((value, key) => {
            this.stats.set(key, (this.stats.get(key) || 0) + value);
        });
        this.circlet.stats.forEach((value, key) => {
            this.stats.set(key, (this.stats.get(key) || 0) + value);
        });
        return this.stats;
    }
    stringifyArtifactSet() {
        let output = "";
        output += stringifyArtifact(this.flower) + "\n";
        output += stringifyArtifact(this.plume) + "\n";
        output += stringifyArtifact(this.sands) + "\n";
        output += stringifyArtifact(this.goblet) + "\n";
        output += stringifyArtifact(this.circlet) + "\n";
        output += "Dmg: " + this.dmg + "\n";
        output += statsInOrder.map((stat) => stat + ": " + this.stats.get(stat)).join("\n");
        return output;
    }
}
function generateMaxArtifactSet(count, formula, minmumER, usefulStats) {
    let artifactSet = new Map();
    for (let key of Object.keys(ArtifactType)) {
        if (isNaN(Number(key))) {
            artifactSet.set(ArtifactType[key], new SortedArtifactList());
        }
    }
    let strongboxCurrentCount = 0, totalStrongboxCount = 0;
    let strongbox = false;
    let totalArtifactCount = 0;
    for (let i = 0; i < count; i++) {
        let artifact = generateArtifact(strongbox, true, usefulStats);
        totalArtifactCount++;
        if (strongbox) {
            totalStrongboxCount++;
            strongbox = false;
        }
        artifactSet.get(artifact.type).insert(artifact);
        if (artifactSet.get(artifact.type).removeLowestIfFull()) {
            strongboxCurrentCount++;
            if (strongboxCurrentCount == 3) {
                i--;
                strongbox = true;
                strongboxCurrentCount = 0;
            }
        }
    }
    let maxArifactSet = optimizeArtifactSet(artifactSet, formula, minmumER);
    return maxArifactSet;
}
function optimizeArtifactSet(allArtifacts, formula, minmumER) {
    let offpieceFlower = false;
    let offpiecePlume = false;
    let offpieceSands = false;
    let offpieceGoblet = false;
    let offpieceCirclet = false;
    let maxArtifactSet = null;
    let maxIdx = 15;
    for (let flowerIdx = 0; flowerIdx < allArtifacts.get(ArtifactType.Flower).getArtifacts().length && flowerIdx < maxIdx; flowerIdx++) {
        let flower = allArtifacts.get(ArtifactType.Flower).getArtifacts()[flowerIdx];
        offpieceFlower = flower.offpiece;
        for (let plumeIdx = 0; plumeIdx < allArtifacts.get(ArtifactType.Plume).getArtifacts().length && plumeIdx < maxIdx; plumeIdx++) {
            let plume = allArtifacts.get(ArtifactType.Plume).getArtifacts()[plumeIdx];
            offpiecePlume = plume.offpiece;
            if (offpieceFlower && offpiecePlume) {
                continue;
            }
            for (let sandIdx = 0; sandIdx < allArtifacts.get(ArtifactType.Sands).getArtifacts().length && sandIdx < maxIdx; sandIdx++) {
                let sands = allArtifacts.get(ArtifactType.Sands).getArtifacts()[sandIdx];
                offpieceSands = sands.offpiece;
                if (offpieceSands && (offpieceFlower || offpiecePlume)) {
                    continue;
                }
                for (let gobletIdx = 0; gobletIdx < allArtifacts.get(ArtifactType.Goblet).getArtifacts().length && gobletIdx < maxIdx; gobletIdx++) {
                    let goblet = allArtifacts.get(ArtifactType.Goblet).getArtifacts()[gobletIdx];
                    offpieceGoblet = goblet.offpiece;
                    if (offpieceGoblet && (offpieceFlower || offpiecePlume || offpieceSands)) {
                        continue;
                    }
                    for (let circletIdx = 0; circletIdx < allArtifacts.get(ArtifactType.Circlet).getArtifacts().length && circletIdx < maxIdx; circletIdx++) {
                        let circlet = allArtifacts.get(ArtifactType.Circlet).getArtifacts()[circletIdx];
                        offpieceCirclet = circlet.offpiece;
                        if (offpieceCirclet && (offpieceFlower || offpiecePlume || offpieceSands || offpieceGoblet)) {
                            continue;
                        }
                        let artifactSet = new ArtifactSet(flower, plume, sands, goblet, circlet);
                        let stats = artifactSet.sumArtifactStats();
                        if (minmumER > 0 && (stats.get(Stat.ER) == null || stats.get(Stat.ER) < minmumER)) {
                            continue;
                        }
                        artifactSet.dmg = calculateDmg(stats, formula);
                        if (maxArtifactSet == null || artifactSet.dmg > maxArtifactSet.dmg) {
                            maxArtifactSet = artifactSet;
                        }
                    }
                }
            }
        }
    }
    return maxArtifactSet;
}
function calculateDmg(stats, formula) {
    stats.forEach((value, key) => {
        formula = formula.replace(`{${key}}`, value.toString());
    });
    for (let i = 0; i < statsInOrder.length; i++) {
        let stat = statsInOrder[i];
        formula = formula.replace(`{${stat}}`, "0");
    }
    let output;
    try {
        output = eval(formula);
    }
    catch (error) {
        output = -1;
    }
    return output;
}
function getUsefulStats(formula, minmumER) {
    let stats = new Set();
    for (let i = 0; i < statsInOrder.length; i++) {
        let stat = statsInOrder[i];
        if (formula.includes(`{${stat}}`)) {
            stats.add(stat);
        }
    }
    if (minmumER > 0) {
        stats.add(Stat.ER);
    }
    return stats;
}
function stringifyArtifact(artifact) {
    let output = artifact.type + "\n";
    artifact.stats.forEach((value, key) => {
        output += key + ": " + value + "\n";
    });
    output += "Dmg: " + artifact.dmg + "\n";
    output += "Offpiece: " + artifact.offpiece + "\n";
    output += "Useful Stats: " + artifact.usefulStats + "\n";
    return output;
}
function generateArtifact(strongbox, strongboxDesiredSet, usefulStats) {
    let selection = Math.floor(Math.random() * 5);
    let artifact = null;
    switch (selection) {
        case 0:
            artifact = generateFlower(strongbox, usefulStats);
            break;
        case 1:
            artifact = generatePlume(strongbox, usefulStats);
            break;
        case 2:
            artifact = generateSands(strongbox, usefulStats);
            break;
        case 3:
            artifact = generateGoblet(strongbox, usefulStats);
            break;
        case 4:
            artifact = generateCirclet(strongbox, usefulStats);
            break;
    }
    if (strongbox) {
        artifact.offpiece = !strongboxDesiredSet;
    }
    else {
        artifact.offpiece = Math.random() < .5;
    }
    return artifact;
}
function generateFlower(strongbox, usefulStats) {
    let artifact = new Artifact(ArtifactType.Flower);
    artifact.stats.set(Stat.HP, MAX_MAIN_STAT.get(Stat.HP));
    let subStats = pickRandomSubStat(artifact, strongbox, usefulStats);
    subStats.forEach((value, key) => {
        artifact.stats.set(key, value);
    });
    return artifact;
}
function generatePlume(strongbox, usefulStats) {
    let artifact = new Artifact(ArtifactType.Plume);
    artifact.stats.set(Stat.ATK, MAX_MAIN_STAT.get(Stat.ATK));
    let subStats = pickRandomSubStat(artifact, strongbox, usefulStats);
    subStats.forEach((value, key) => {
        artifact.stats.set(key, value);
    });
    return artifact;
}
const SAND_PROBABILITY = new Map();
SAND_PROBABILITY.set(Stat.ATK_PERC, .2668);
SAND_PROBABILITY.set(Stat.DEF_PERC, .2668);
SAND_PROBABILITY.set(Stat.HP_PERC, .2668);
SAND_PROBABILITY.set(Stat.EM, .1);
SAND_PROBABILITY.set(Stat.ER, .1);
function generateSands(strongbox, usefulStats) {
    let artifact = new Artifact(ArtifactType.Sands);
    let mainStat = pickRandomMainStat(SAND_PROBABILITY);
    if (usefulStats.has(mainStat)) {
        artifact.usefulStats += 12;
    }
    artifact.stats.set(mainStat, MAX_MAIN_STAT.get(mainStat));
    let subStats = pickRandomSubStat(artifact, strongbox, usefulStats);
    subStats.forEach((value, key) => {
        artifact.stats.set(key, value);
    });
    return artifact;
}
const GOBLET_PROBABILITY = new Map();
GOBLET_PROBABILITY.set(Stat.ATK_PERC, .1925);
GOBLET_PROBABILITY.set(Stat.DEF_PERC, .19);
GOBLET_PROBABILITY.set(Stat.HP_PERC, .1925);
GOBLET_PROBABILITY.set(Stat.EM, .025);
GOBLET_PROBABILITY.set(Stat.PYRO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.HYDRO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.CRYO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.ELECTRO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.ANEMO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.GEO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.DENDRO_DMG, .05);
GOBLET_PROBABILITY.set(Stat.PHYS_DMG, .05);
function generateGoblet(strongbox, usefulStats) {
    let artifact = new Artifact(ArtifactType.Goblet);
    let mainStat = pickRandomMainStat(GOBLET_PROBABILITY);
    if (usefulStats.has(mainStat)) {
        artifact.usefulStats += 12;
    }
    artifact.stats.set(mainStat, MAX_MAIN_STAT.get(mainStat));
    let subStats = pickRandomSubStat(artifact, strongbox, usefulStats);
    subStats.forEach((value, key) => {
        artifact.stats.set(key, value);
    });
    return artifact;
}
const CIRCLET_PROBABILITY = new Map();
CIRCLET_PROBABILITY.set(Stat.ATK_PERC, .22);
CIRCLET_PROBABILITY.set(Stat.DEF_PERC, .22);
CIRCLET_PROBABILITY.set(Stat.HP_PERC, .22);
CIRCLET_PROBABILITY.set(Stat.EM, .04);
CIRCLET_PROBABILITY.set(Stat.CR, .1);
CIRCLET_PROBABILITY.set(Stat.CD, .1);
function generateCirclet(strongbox, usefulStats) {
    let artifact = new Artifact(ArtifactType.Circlet);
    let mainStat = pickRandomMainStat(CIRCLET_PROBABILITY);
    if (usefulStats.has(mainStat)) {
        artifact.usefulStats += 12;
    }
    artifact.stats.set(mainStat, MAX_MAIN_STAT.get(mainStat));
    let subStats = pickRandomSubStat(artifact, strongbox, usefulStats);
    subStats.forEach((value, key) => {
        artifact.stats.set(key, value);
    });
    return artifact;
}
function pickRandomMainStat(probabilities) {
    let total = 0;
    probabilities.forEach((value, key) => {
        total += value;
    });
    let random = Math.random() * total;
    let current = 0;
    for (let [key, value] of probabilities) {
        current += value;
        if (random <= current) {
            return key;
        }
    }
    return Stat.ATK_PERC;
}
const SUB_STAT_WEIGHTS = new Map();
SUB_STAT_WEIGHTS.set(Stat.HP, 6);
SUB_STAT_WEIGHTS.set(Stat.HP_PERC, 4);
SUB_STAT_WEIGHTS.set(Stat.ATK, 6);
SUB_STAT_WEIGHTS.set(Stat.ATK_PERC, 4);
SUB_STAT_WEIGHTS.set(Stat.DEF, 6);
SUB_STAT_WEIGHTS.set(Stat.DEF_PERC, 4);
SUB_STAT_WEIGHTS.set(Stat.ER, 4);
SUB_STAT_WEIGHTS.set(Stat.EM, 4);
SUB_STAT_WEIGHTS.set(Stat.CR, 3);
SUB_STAT_WEIGHTS.set(Stat.CD, 3);
const SUB_STAT_VALUES = new Map();
SUB_STAT_VALUES.set(Stat.HP, [167, 191, 215, 239]);
SUB_STAT_VALUES.set(Stat.HP_PERC, [.0326, .0373, .042, .0466]);
SUB_STAT_VALUES.set(Stat.ATK, [10.89, 12.45, 14.0, 15.56]);
SUB_STAT_VALUES.set(Stat.ATK_PERC, [.0326, .0373, .042, .0466]);
SUB_STAT_VALUES.set(Stat.DEF, [12.96, 14.82, 16.67, 18.52]);
SUB_STAT_VALUES.set(Stat.DEF_PERC, [.0326, .0373, .042, .0466]);
SUB_STAT_VALUES.set(Stat.ER, [.036, .0413, .0466, .0519]);
SUB_STAT_VALUES.set(Stat.EM, [23, 26, 29, 33]);
SUB_STAT_VALUES.set(Stat.CR, [.0218, .0249, .028, .0311]);
SUB_STAT_VALUES.set(Stat.CD, [.0435, .0497, .056, .0622]);
const USEFUL_STATS_WORTH = new Map();
USEFUL_STATS_WORTH.set(Stat.HP, .5);
USEFUL_STATS_WORTH.set(Stat.HP_PERC, 1);
USEFUL_STATS_WORTH.set(Stat.ATK, .5);
USEFUL_STATS_WORTH.set(Stat.ATK_PERC, 1);
USEFUL_STATS_WORTH.set(Stat.DEF, .5);
USEFUL_STATS_WORTH.set(Stat.DEF_PERC, 1);
USEFUL_STATS_WORTH.set(Stat.ER, 1);
USEFUL_STATS_WORTH.set(Stat.EM, 1);
USEFUL_STATS_WORTH.set(Stat.CR, 1.5);
USEFUL_STATS_WORTH.set(Stat.CD, 1.5);
function pickRandomSubStat(artifact, strongbox, usefulStats) {
    let mainStat = artifact.stats.keys().next().value;
    let newSubStatWeight = new Map(SUB_STAT_WEIGHTS);
    newSubStatWeight.delete(mainStat);
    let subStats = [];
    let rolledSubStatValues = new Map();
    for (let i = 0; i < 4; i++) {
        let total = 0;
        newSubStatWeight.forEach((value, key) => {
            total += value;
        });
        let random = Math.random() * total;
        let current = 0;
        for (let [key, value] of newSubStatWeight) {
            current += value;
            if (random <= current) {
                subStats.push(key);
                if (usefulStats.has(key)) {
                    artifact.usefulStats += USEFUL_STATS_WORTH.get(key);
                }
                newSubStatWeight.delete(key);
                break;
            }
        }
    }
    subStats.forEach((value, index) => {
        let subStatValues = SUB_STAT_VALUES.get(value);
        let subStatValue = subStatValues[Math.floor(Math.random() * subStatValues.length)];
        rolledSubStatValues.set(value, subStatValue);
    });
    let maxRoll = strongbox ? (Math.random() < .66 ? 4 : 5) : (Math.random() < .8 ? 4 : 5);
    for (let i = 0; i < maxRoll; i++) {
        let subStat = subStats[Math.floor(Math.random() * subStats.length)];
        if (usefulStats.has(subStat)) {
            artifact.usefulStats += USEFUL_STATS_WORTH.get(subStat);
        }
        let subStatValues = SUB_STAT_VALUES.get(subStat);
        let subStatValue = subStatValues[Math.floor(Math.random() * subStatValues.length)];
        rolledSubStatValues.set(subStat, rolledSubStatValues.get(subStat) + subStatValue);
    }
    return rolledSubStatValues;
}
//# sourceMappingURL=main.js.map