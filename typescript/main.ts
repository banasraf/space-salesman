import {data_string} from "./data";
import {GameModel, GameStorage} from "./model";
import {GameView} from "./view"
import {GameController} from "./controller";

let gm: GameModel = new GameModel(JSON.parse(data_string));

const TIME_MILLIS = 10;
const TIME_INGAME = 0.01;

window.onload = () => {
    let storage = new GameStorage('ranking', 'name');
    if (storage.readName() === null) window.location.replace('main.html');
    let gc = new GameController(gm, storage);
    let stepper = () => {
        if (gc.timeStep(TIME_INGAME)) {
            setTimeout(stepper, TIME_MILLIS)
        }
    };
    setTimeout(stepper, TIME_MILLIS);
};

