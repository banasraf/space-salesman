import {SMap} from "./smap";
import {Spaceport, Trade} from "./controller";
import {data_string} from "./data";

export interface ItemStockInfo {
    available: number;
    buy_price: number;
    sell_price: number;
}

export interface PlanetInfo {
    available_items: { [s: string]: ItemStockInfo; };
    x: number;
    y: number;
}

export interface StarshipInfo {
    cargo_hold_size: number;
    position: string;
}

export interface InitData {
    game_duration: number;
    initial_credits: number;
    items: string[];
    planets: { [s: string]: PlanetInfo; };
    starships: { [s: string]: StarshipInfo; };
}

export class ItemStock {
    available: number;
    readonly buy_price: number;
    readonly sell_price: number;

    constructor(info: ItemStockInfo) {
        this.available = info.available;
        this.buy_price = info.buy_price;
        this.sell_price = info.sell_price;
    }
}

export class Planet {
    readonly x: number;
    readonly y: number;
    stock: SMap<ItemStock>;

    constructor(info: PlanetInfo) {
        this.x = info.x;
        this.y = info.y;
        let items = info.available_items;
        this.stock = {};
        for (let item in items) {
           this.stock[item] = new ItemStock(items[item]);
        }
    }
}

export class Travel {
    constructor(public start: string, public destination: string, public time_left: number) {}
}

export class Starship {
    readonly cargo_hold_size: number;
    cargo: SMap<number>;
    position: string | Travel;

    constructor(info: StarshipInfo) {
        this.cargo_hold_size = info.cargo_hold_size;
        this.cargo = {};
        this.position = info.position;
    }
}

export class GameModel {
    credits: number;
    timer: number;
    planets: SMap<Planet>;
    starships: SMap<Starship>;

    listStarshipsOnPlanet(planet: string): string[] {
        let res: string[] = [];
        for (let starship in this.starships) {
            if (typeof this.starships[starship].position === 'string') {
                if (this.starships[starship].position == planet) {
                    res.push(starship);
                }
            }
        }
        return res;
    }

    getTrade(starship: string, planet: string): Trade {
        return new Trade(this.planets[planet].stock, this.starships[starship].cargo,
            this.starships[starship].cargo_hold_size);
    }

    getSpaceport(starship: string): Spaceport {
        return new Spaceport(this.starships[starship], this.planets);
    }

    constructor(data: InitData) {
        console.log('loool ' + data.initial_credits);
        this.credits = data.initial_credits;
        this.timer = data.game_duration;
        this.planets = {};
        let mp = data.planets;
        for (let planet in mp) {
            this.planets[planet] = new Planet(mp[planet]);
        }
        this.starships = {};
        let ms = data.starships;
        for (let starship in ms) {
            this.starships[starship] = new Starship(ms[starship]);
        }
    }
}

export interface GameRanking {
    rank: {name: string; credits: number}[]
}


export class GameStorage {

    private mockRanking() {
        localStorage.setItem(this.ranking_key, JSON.stringify({
            rank: []
        }));
    }

    public readRanking(): GameRanking | null {
        return JSON.parse(localStorage.getItem(this.ranking_key));
    }

    public addEntryToRanking(name: string, credits: number) {
        let r = this.readRanking() as GameRanking;
        r.rank.sort(((a, b) => {return b.credits - a.credits}));
        if (r.rank.length < 10) {
            r.rank.push({name: name, credits: credits});
        } else if (credits > r.rank[r.rank.length-1].credits) {
            r.rank[r.rank.length-1] = {name: name, credits: credits};
        }
        r.rank.sort(((a, b) => {return b.credits - a.credits}));
        localStorage.setItem(this.ranking_key, JSON.stringify(r));
    }

    public readName(): string | null {
        return (new URLSearchParams(window.location.search)).get(this.name_key);
    }

    public async loadScenario() {
        let id = (new URLSearchParams(window.location.search)).get(this.scenario_id_key);
        let response = await fetch(`/scenarios/${id}`);
        if (response.status == 200) {
            return JSON.parse(await response.text());
        }
    }

    constructor(public ranking_key: string, public name_key: string, public scenario_id_key) {
        if (this.readRanking() === null) {
            this.mockRanking();
        }
    }
}