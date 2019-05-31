import {GameModel, GameStorage, ItemStock, Planet, Starship, Travel} from "./model";
import {SMap} from "./smap";
import {GameView} from "./view";

/*
    getPlanets
    getCredits
    getStarships
    getTimer

 */

// Logic for trading
export class Trade {
    constructor(public stock: SMap<ItemStock>, public cargo: SMap<number>, public cargo_hold_size: number) {}

    cargoSize() {
        let res: number = 0;
        for (let item in this.cargo) {
            res += this.cargo[item];
        }
        return res;
    }

    canBuy(item: string, credits: number): boolean {
        return (item in this.stock)
            && this.stock[item].available > 0
            && this.cargoSize() < this.cargo_hold_size
            && this.stock[item].buy_price <= credits;
    }

    buy(item: string, credits: number): number {
        if (this.canBuy(item, credits)) {
            if (item in this.cargo) {
                this.cargo[item]++;
            } else {
                this.cargo[item] = 1;
            }
            this.stock[item].available--;
            return credits - this.stock[item].buy_price;
        } else {
            throw new Error("Illegal action.");
        }
    }

    canSell(item: string): boolean {
        return (item in this.stock) && (item in this.cargo) && this.cargo[item] > 0;
    }

    sell(item: string, credits: number): number {
        if (this.canSell(item)) {
            if (this.cargo[item] == 1) {
                delete this.cargo[item];
            } else {
                this.cargo[item]--;
            }
            this.stock[item].available++;
            return credits + this.stock[item].sell_price;
        } else {
            throw new Error("Illegal action.");
        }
    }

    sellPrice(item: string): number {
        if (item in this.stock) {
            return this.stock[item].sell_price;
        } else {
            return 0;
        }
    }

    buyPrice(item: string): number {
        if (item in this.stock) {
            return this.stock[item].buy_price;
        } else {
            return 0;
        }
    }
}

// Logic for travelling
export class Spaceport {
    constructor(private starship: Starship, private planets: SMap<Planet>) {}

    canTravel(destination: string): boolean {
        if (typeof this.starship.position === 'string') {
            return this.starship.position != destination;
        } else {
            return false;
        }
    }

    travel(destination: string): number {
        if (this.canTravel(destination)) {
            let dest_x = this.planets[destination].x;
            let dest_y = this.planets[destination].y;
            let start_x = this.planets[<string>this.starship.position].x;
            let start_y = this.planets[<string>this.starship.position].y;
            let time = Math.ceil(Math.sqrt((dest_x - start_x) * (dest_x - start_x)
                + (dest_y - start_y)  * (dest_y - start_y)));
            this.starship.position = new Travel(<string>this.starship.position, destination, time);
            return time;
        } else {
            throw new Error("Illegal action.");
        }
    }

    listDestinations(): string[] {
        let result: string[] = [];
        for (let planet in this.planets) {
            if (this.canTravel(planet)) result.push(planet);
        }
        return result;
    }
}

class StockController {

}

export class GameController {
    private view: GameView;
    private readonly player_name: string;
    constructor(public model: GameModel, private storage: GameStorage) {
        if (storage.readName() === null) throw new Error("No name set.");
        this.player_name = storage.readName();
        this.view = new GameView(model, this.player_name, this);
    }

    sell(starship: string, planet: string, item: string) {
        let t = this.model.getTrade(starship, planet);
        this.model.credits = t.sell(item, this.model.credits);
        this.view.updateCredits();
        this.view.updateStocks();
    }

    buy(starship: string, planet: string, item: string) {
        let t = this.model.getTrade(starship, planet);
        this.model.credits = t.buy(item, this.model.credits);
        this.view.updateCredits();
        this.view.updateStocks();
    }

    travel(starship: string, destination: string) {
        let spaceport = this.model.getSpaceport(starship);
        spaceport.travel(destination);
        this.view.updatePosition(starship);
    }

    endGame() {
        this.storage.addEntryToRanking(this.player_name, this.model.credits);
        GameView.goToMainScreen();
    }

    timeStep(time: number): boolean {
        this.model.timer -= time;
        this.view.updateTimer();
        if (this.model.timer <= 0) {
            this.endGame();
            return false;
        }
        for (let starship in this.model.starships) {
            let s_obj = this.model.starships[starship];
            if (s_obj.position instanceof Travel) {
                s_obj.position.time_left -= time;
                if (s_obj.position.time_left <= 0) s_obj.position = s_obj.position.destination;
                this.view.updatePosition(starship);
            }
        }
        return true;
    }

}