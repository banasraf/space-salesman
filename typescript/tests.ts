import {GameModel, InitData} from "./model";
import { expect } from "chai";
import "mocha";

const json_string = "{\n" +
    "\n" +
    "    \"items\": [\n" +
    "\n" +
    "        \"Nuka-Cola\",\n" +
    "\n" +
    "        \"Piasek\",\n" +
    "\n" +
    "        \"Ziemniaki\",\n" +
    "\n" +
    "        \"Złoto\"\n" +
    "\n" +
    "    ],\n" +
    "\n" +
    "    \"planets\": {\n" +
    "\n" +
    "        \"Ziemia\": {\n" +
    "\n" +
    "            \"x\": 0,\n" +
    "\n" +
    "            \"y\": 0,\n" +
    "\n" +
    "            \"available_items\": {\n" +
    "\n" +
    "                \"Ziemniaki\": {\n" +
    "\n" +
    "                    \"available\": 15002900,\n" +
    "\n" +
    "                    \"buy_price\": 2900,\n" +
    "\n" +
    "                    \"sell_price\": 1500\n" +
    "\n" +
    "                },\n" +
    "\n" +
    "                \"Piasek\": {\n" +
    "\n" +
    "                    \"available\": 0,\n" +
    "\n" +
    "                    \"buy_price\": 44,\n" +
    "\n" +
    "                    \"sell_price\": 32\n" +
    "\n" +
    "                }\n" +
    "\n" +
    "            }\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "    },\n" +
    "\n" +
    "    \"starships\": {\n" +
    "\n" +
    "        \"Rocinante\": {\n" +
    "\n" +
    "            \"position\": \"Ziemia\",\n" +
    "\n" +
    "            \"cargo_hold_size\": 128\n" +
    "\n" +
    "        }\n" +
    "\n" +
    "    },\n" +
    "\n" +
    "    \"game_duration\": 1000,\n" +
    "\n" +
    "    \"initial_credits\": 1\n" +
    "\n" +
    "}";

describe("GameModel construction", () => {

    it("should load data from json", () => {
        let data: InitData = JSON.parse(json_string);
        let gm: GameModel = new GameModel(data);
        expect(gm.planets["Ziemia"].x).to.equal(0);

    });

});