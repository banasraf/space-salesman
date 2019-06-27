import {data_string} from "./data";
import {GameModel, GameStorage} from "./model";
import {GameController} from "./controller";

// let gm: GameModel = new GameModel(JSON.parse(data_string));

const TIME_MILLIS = 10;
const TIME_INGAME = 0.01;

window.onload = async () => {
    let storage = new GameStorage('ranking', 'nick', 'scenario_select');
    let gm = new GameModel(await storage.loadScenario());
    console.log(gm.credits);
    if (storage.readName() === null || storage.readName().length == 0) window.location.replace('main.html');
    let gc = new GameController(gm, storage);
    let stepper = () => {
        if (gc.timeStep(TIME_INGAME)) {
            setTimeout(stepper, TIME_MILLIS)
        }
    };
    setTimeout(stepper, TIME_MILLIS);
};

