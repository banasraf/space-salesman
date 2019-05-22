import {data_string} from "./data";
import {GameModel} from "./model";

let gm: GameModel = new GameModel(JSON.parse(data_string));

console.log(gm.planets["Ziemia"]);