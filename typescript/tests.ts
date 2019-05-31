import {GameModel, InitData, ItemStock, Planet, Starship, Travel} from "./model";
import { expect } from "chai";
import "mocha";
import {Spaceport, Trade} from "./controller";
import {SMap} from "./smap";

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
        expect(gm.planets["Ziemia"].stock["Ziemniaki"].available).to.equal(15002900);
        expect(gm.planets["Ziemia"].stock["Piasek"].sell_price).to.equal(32);
        expect(<string>gm.starships["Rocinante"].position).to.equal("Ziemia");
        expect(gm.timer).to.equal(1000);
    });

});

describe("Trade", () => {
    let stock: SMap<ItemStock>  = {};
    stock["x"] = new ItemStock({available: 4, sell_price: 10, buy_price: 5});
    stock["y"] = new ItemStock({available: 3, sell_price: 5, buy_price: 10});
    let cargo: SMap<number> = {};
    cargo["x"] = 4;
    let trade: Trade = new Trade(stock, cargo, 4);
    it('should allow to sell', function () {
        expect(trade.sell("x", 50)).to.equal(60);
        expect(stock["x"].available).to.equal(5);
        expect(cargo["x"]).to.equal(3);
    });
    it("should allow to buy", () => {
        expect(trade.buy("y", 60)).to.equal(50);
        expect(stock["y"].available).to.equal(2);
        expect(cargo["y"]).to.equal(1);
    });
    it('should not allow to overfill cargo', function () {
        expect(trade.canBuy("x", 50)).to.false;
    });
    it('should not allow to buy without enough credits', function () {
        expect(trade.canBuy("x", 2)).to.false;
    });
});

describe("Spaceport", () => {
    let starship1: Starship = new Starship({position: "X", cargo_hold_size: 0});
    let planetx: Planet = new Planet({x: 0, y: 10, available_items: {}});
    let planety: Planet = new Planet({x: 10, y: 20, available_items: {}});
    let planets = {"X": planetx, "Y": planety};
    let sp: Spaceport = new Spaceport(starship1, planets);
    it('should allow to travel', function () {
        let time = sp.travel("Y");
        expect(time).to.equal(15);
        expect(<Travel>starship1.position).to.equal(new Travel("X", "Y", 15));
    });
    it('should not allow to move a starship in travel', function () {
        expect(sp.canTravel("Y")).to.false;
    });
});