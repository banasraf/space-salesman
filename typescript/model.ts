
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

// let data: InitData = JSON.parse(data_string);

// console.log(data.game_duration, data.initial_credits);
// for (let item of data.items) {
//     console.log(item)
// }
//
// for (let planet in data.planets) {
//     console.log(planet);
//     let info: PlanetInfo = data.planets[planet];
//     for (let item in info.available_items) {
//         let item_info: ItemStockInfo = info.available_items[item];
//         console.log(`\t ${item}`);
//         console.log(`\t\t ${item_info.available} ${item_info.buy_price} ${item_info.sell_price}`);
//     }
// }

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
    stock: Map<string, ItemStock>;

    constructor(info: PlanetInfo) {
        this.x = info.x;
        this.y = info.y;
        let items = info.available_items;
        this.stock = new Map<string, ItemStock>();
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
    cargo: Map<string, number>;
    position: string | Travel;

    constructor(info: StarshipInfo) {
        this.cargo_hold_size = info.cargo_hold_size;
        this.cargo = new Map<string, number>();
        this.position = info.position;
    }
}

export class GameModel {
    credits: number;
    timer: number;
    planets: Map<string, Planet>;
    starships: Map<string, Starship>;

    constructor(data: InitData) {
        this.credits = data.initial_credits;
        this.timer = data.game_duration;
        this.planets = new Map<string, Planet>();
        let mp = data.planets;
        for (let planet in mp) {
            this.planets[planet] = new Planet(mp[planet]);
        }
        this.starships = new Map<string, Starship>();
        let ms = data.starships;
        for (let starship in ms) {
            this.starships[starship] = new Starship(ms[starship]);
        }
    }
}
//
// let gm: GameModel = new GameModel(data);
//
// console.log(gm.planets['Ziemia']);