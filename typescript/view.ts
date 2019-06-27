import {GameModel, Planet, Starship, Travel} from "./model";
import {SMap} from "./smap";
import {PlanetBlockView, PlanetPopupView} from "./planet-view";
import {StarshipBlockView, StarshipPopupView} from "./starship-view";
import {MapView} from "./map-view";

function log(a: string) {
    console.log(a);
}

interface Controller {
    buy: (a: string, b: string, c: string) => void;
    sell: (a: string, b: string, c: string) => void;
    travel: (a: string, b: string) => void;
}

export class GameView {
    timer: HTMLSpanElement;
    credits: HTMLSpanElement;
    planets_container: HTMLDivElement;
    planets: SMap<PlanetBlockView>;
    starships_container: HTMLDivElement;
    starships: SMap<StarshipBlockView>;
    popup_layer: HTMLDivElement;
    planet_modals: SMap<PlanetPopupView>;
    starship_modals: SMap<StarshipPopupView>;
    current_modal: PlanetPopupView | StarshipPopupView;
    map_view: MapView;


    private listPlanets(planets: SMap<Planet>) {
        for (let planet in planets) {
            let block_view = new PlanetBlockView(planet, planets[planet],
                (a) => {this.showPlanetModal(a)});
            this.planets[planet] = block_view;
            this.planets_container.appendChild(block_view.elem);
        }
    }

    private listStarships(starships: SMap<Starship>) {
        for (let starship in starships) {
            let block_view = new StarshipBlockView(starship, <string>starships[starship].position,
                (a) => {this.showStarshipModal(a)});
            this.starships[starship] = block_view;
            this.starships_container.appendChild(block_view.elem);
        }
    }

    private prepareModals() {
        this.popup_layer = document.getElementById("popup_layer") as HTMLDivElement;
        this.popup_layer.style.display = 'none';
        this.planet_modals = {};
        let planets = this.model.planets;
        for (let planet in planets) {
            this.planet_modals[planet] =
                new PlanetPopupView(planet, planets[planet], this.model.listStarshipsOnPlanet(planet),
                    (a) => { this.showStarshipModal(a) });
            this.popup_layer.appendChild(this.planet_modals[planet].elem);
        }
        this.starship_modals = {};
        let starships = this.model.starships;
        for (let s in starships) {
            let p = <string>starships[s].position;
            this.starship_modals[s] =
                new StarshipPopupView(s, p, this.model.getTrade(s, p), this.model.getSpaceport(s), this.model.credits,
                    (a, b, c) => {this.controller.sell(a, b, c)},
                    (a, b, c) => {console.log("sdf");this.controller.buy(a, b, c)},
                    (a, b) => {this.controller.travel(a, b)},
                    (a) => {this.showPlanetModal(a)});
            this.popup_layer.appendChild(this.starship_modals[s].elem);
        }
        this.popup_layer.onclick = (event: Event) => {
            if (event.target == this.popup_layer) {
                this.popup_layer.style.display = 'none';
                this.current_modal.hide();
                this.current_modal = null;
            }
        }
    }

    private showPlanetModal(planet: string) {
        this.popup_layer.style.display = 'flex';
        if (this.current_modal)  this.current_modal.hide();
        this.current_modal = this.planet_modals[planet];
        this.current_modal.updateStock(this.model.planets[this.current_modal.name].stock);
        this.current_modal.updateStarships(this.model.listStarshipsOnPlanet(this.current_modal.name));
        this.current_modal.show();
    }

    private showStarshipModal(starship: string) {
        this.popup_layer.style.display = 'flex';
        if (this.current_modal) this.current_modal.hide();
        this.current_modal = this.starship_modals[starship];
        let pos = this.model.starships[starship].position;
        if (pos instanceof Travel) {
            this.current_modal.updateInTravel(this.model.starships[starship].cargo, pos);
        } else {
            this.current_modal.updateOnPlanet(pos, this.model.getTrade(starship, pos),
                this.model.getSpaceport(starship), this.model.credits);
        }
        this.current_modal.show();
    }

    private showPlayerName(name: string) {
        let elem = document.getElementById('nickname');
        elem.innerText = name;
    }

    constructor(private model: GameModel, player_name: string, private controller: Controller) {
        this.showPlayerName(player_name);
        this.timer = document.getElementById("time_info").getElementsByTagName("span")[0];
        this.map_view = new MapView(this.model, (p) => {this.showPlanetModal(p)},
            (p) => {this.showStarshipModal(p)});
        this.updateTimer();
        this.credits = document.getElementById("result").getElementsByTagName("span")[0];
        this.updateCredits();
        this.planets_container =
            document
                .getElementById("planets")
                .getElementsByClassName("flex_container")[0] as HTMLDivElement;
        this.planets = {};
        this.listPlanets(model.planets);
        this.starships_container =
            document
                .getElementById("spaceships")
                .getElementsByClassName("flex_container")[0] as HTMLDivElement;
        this.starships = {};
        this.listStarships(model.starships);
        this.prepareModals();
    }

    updateTimer() {
        this.timer.innerText = Math.ceil(this.model.timer).toString();
        this.map_view.update();
    };

    updateCredits() {
        this.credits.innerText = this.model.credits.toString();
    }

    updateStocks() {
        if (this.current_modal instanceof StarshipPopupView) {
            let s = this.current_modal.name;
            let s_obj = this.model.starships[s];
            if (typeof s_obj.position === 'string') {
                this.current_modal.updateOnPlanet(s_obj.position,
                    this.model.getTrade(s, s_obj.position), this.model.getSpaceport(s), this.model.credits);
            } else {
                this.current_modal.updateInTravel(s_obj.cargo, s_obj.position);
            }
        } else {
            let stock = this.model.planets[this.current_modal.name].stock;
            this.current_modal.updateStock(stock);
        }
    }

    updatePosition(starship: string) {
        this.starships[starship].updatePosition(this.model.starships[starship].position);
        let pos = this.model.starships[starship].position;
        if (pos instanceof Travel) {
            if (this.current_modal instanceof StarshipPopupView && this.current_modal.name === starship) {
                this.current_modal.updateInTravel(this.model.starships[starship].cargo, pos);
            } else if (this.current_modal instanceof PlanetPopupView && this.current_modal.name == pos.start) {
                this.current_modal.updateStarships(this.model.listStarshipsOnPlanet(pos.start));
            }
        } else {
            if (this.current_modal instanceof StarshipPopupView && this.current_modal.name === starship) {
                this.current_modal.updateOnPlanet(pos,
                    this.model.getTrade(starship, pos), this.model.getSpaceport(starship), this.model.credits);
            } else if (this.current_modal instanceof PlanetPopupView && this.current_modal.name == pos) {
                this.current_modal.updateStarships(this.model.listStarshipsOnPlanet(pos));
            }
        }
    }

    static goToMainScreen() {
        window.location.replace('main.html');
    }
}