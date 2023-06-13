"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSIcons = exports.GSScreenDeviceZone = exports.GSScreenDeviceType = exports.GSScreen = exports.GameSenseEvent = exports.GameSense = void 0;
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
/**
 * A wrapper for the GameSense REST API.
 */
class GameSense {
    /**
     * Initializes the GameSense API. If no options are provided, the default address will be used.
     * The address is obtained automatically from the SteelSeries Engine 3 coreProps.json file.
     * This will only work on Windows and OSX.
     * @param options The options to use when initializing the GameSense API.
     */
    constructor(options) {
        this.windowsAddressPath = "C:/ProgramData/SteelSeries/SteelSeries Engine 3/coreProps.json";
        this.osxAddressPath = "/Library/Application Support/SteelSeries Engine 3/coreProps.json";
        this.options = options;
        this.gameOptions = options.game;
        this.address = "";
        if (options.windowsAddressPath) {
            this.windowsAddressPath = options.windowsAddressPath;
        }
        if (options.osxAddressPath) {
            this.osxAddressPath = options.osxAddressPath;
        }
        if (options.address) {
            this.address = options.address;
        }
        else {
            this.getAddress()
                .then((address) => {
                this.address = address;
            })
                .catch((err) => {
                console.log(err);
            });
        }
    }
    /**
     * Gets the address for the SteelSeries API.
     * If it has already been found, another request will not be made.
     * Otherwise, a request to the path of the SteelSeries Engine 3 coreProps.json file will be made.
     * This is run automatically when initializing the GameSense API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#server-discovery|Server Discovery}
     * @returns The address defined in the SteelSeries Engine 3 coreProps.json file.
     */
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.address) {
                return new Promise((resolve) => resolve(this.address));
            }
            return new Promise((resolve, reject) => {
                if (process.platform === "win32") {
                    const data = fs.readFileSync(this.windowsAddressPath, "utf8");
                    const json = JSON.parse(data);
                    this.address = json.address;
                    resolve(json.address);
                }
                else if (process.platform === "darwin") {
                    const data = fs.readFileSync(this.osxAddressPath, "utf8");
                    const json = JSON.parse(data);
                    this.address = json.address;
                    resolve(json.address);
                }
                else {
                    reject("Unsupported platform (Windows and OSX only)");
                }
            });
        });
    }
    /**
     * Registers the game with the SteelSeries API.
     * This is run automatically when initializing the GameSense API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#registering-a-game|Registering a Game}
     */
    registerGame() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = {
                    game: this.gameOptions.gameId,
                    game_display_name: this.gameOptions.gameDisplayName,
                    developer: this.gameOptions.developer,
                    deinitialize_timer_ms: this.gameOptions.deinitializeTimerMs
                };
                this.post("/game_metadata", data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            });
        });
    }
    /**
     * Register an event. This does not allow for the use of event handlers.
     * @param event The event to register.
     */
    registerEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = {
                    game: event.gameId,
                    event: event.eventId,
                    min_value: event.minValue,
                    max_value: event.maxValue,
                    icon_id: event.iconId,
                    value_optional: event.valueOptional
                };
                this.post("/register_game_event", data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            });
        });
    }
    /**
     * Binds a screen to an event.
     * @param event The event to bind to.
     * @param handler The screen to bind.
     */
    bindScreen(event, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = {
                    game: event.gameId,
                    event: event.eventId,
                    min_value: event.minValue,
                    max_value: event.maxValue,
                    icon_id: event.iconId,
                    handlers: [
                        {
                            "device-type": handler.deviceType,
                            zone: handler.zone,
                            mode: handler.mode,
                            datas: handler.datas
                        }
                    ]
                };
                this.post("/bind_game_event", data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
            });
        });
    }
    /**
     * Used internally for sending requests to the SteelSeries API. Only use if you know what you are doing.
     * @param path The path to send the request to.
     * @param data The JSON data to send with the request.
     */
    post(path, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const options = {
                    hostname: this.address.substring(0, this.address.indexOf(":")),
                    port: parseInt(this.address.substring(this.address.indexOf(":") + 1)),
                    path: path,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                };
                const req = http.request(options, (res) => {
                    res.on("error", (err) => {
                        reject(err);
                    });
                    if (res.statusCode !== 200) {
                        reject(`Invalid status code: ${res.statusCode}`);
                    }
                    else {
                        resolve();
                    }
                });
                req.on("error", (err) => {
                    reject(err);
                });
                req.write(JSON.stringify(data));
                req.end();
            });
        });
    }
}
exports.GameSense = GameSense;
/**
 * A wrapper for a GameSense event to send to the API.
 */
class GameSenseEvent {
    /**
     * Creates a new GameSense event.
     * @param options The options for the event.
     */
    constructor(options) {
        this.value = 0;
        this.options = options;
        this.gameId = options.gameId;
        this.eventId = options.eventId;
        this.minValue = options.minValue || 0;
        this.maxValue = options.maxValue || 100;
        this.iconId = options.icon || GSIcons.NONE;
        this.valueOptional = options.valueOptional || false;
    }
    /**
     * Sends the event to the SteelSeries API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#event-context-data Event Context Data}
     * @param gs The GameSense API to use.
     * @param value The new value to send to the SteelSeries API.
     * @param frame [Optional] Additional context data to send. It should be a simple JSON object of key-value pairs. Values must be basic types and arrays. This data can be accessed in handlers. (Default: undefined)
     */
    send(gs, value, frame) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const data = {
                    game: this.gameId,
                    event: this.eventId,
                    data: {
                        value: value,
                        frame: frame
                    }
                };
                gs.post("/game_event", data)
                    .then(() => {
                    resolve();
                })
                    .catch((err) => {
                    reject(err);
                });
                this.value = value;
            });
        });
    }
}
exports.GameSenseEvent = GameSenseEvent;
/**
 * A wrapper for a keyboard screen to send to the SteelSeries API.
 */
class GSScreen {
    /**
     * Creates a new GameSense screen.
     * @param options The options for the screen.
     */
    constructor(options) {
        this.mode = "screen";
        this.datas = [];
        this.options = options;
        this.deviceType = options.deviceType;
        this.zone = options.zone;
    }
    addLine(line) {
        if (this.datas[0]) {
            this.datas[0].lines.push(line);
        }
        else {
            this.datas.push({
                lines: [line]
            });
        }
    }
}
exports.GSScreen = GSScreen;
/**
 * The device type for a screen device.
 * @param SCREEN_128x36 Rival 700, Rival 710
 * @param SCREEN_128x40 Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
 * @param SCREEN_128x48 Arctis Pro Wireless
 * @param SCREEN_128x52 GameDAC / Arctis Pro + GameDAC
 * @param SCREEN Any
 */
var GSScreenDeviceType;
(function (GSScreenDeviceType) {
    /**
     * Rival 700, Rival 710
     */
    GSScreenDeviceType["SCREEN_128x36"] = "screened-128x36";
    /**
     * Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
     */
    GSScreenDeviceType["SCREEN_128x40"] = "screened-128x40";
    /**
     * Arctis Pro Wireless
     */
    GSScreenDeviceType["SCREEN_128x48"] = "screened-128x48";
    /**
     * GameDAC / Arctis Pro + GameDAC
     */
    GSScreenDeviceType["SCREEN_128x52"] = "screened-128x52";
    /**
     * Any
     */
    GSScreenDeviceType["SCREEN"] = "screened";
})(GSScreenDeviceType = exports.GSScreenDeviceType || (exports.GSScreenDeviceType = {}));
/**
 * The zone for a screen device. All current OLED devices have a single screen. This may change in the future, introducing new zones.
 */
var GSScreenDeviceZone;
(function (GSScreenDeviceZone) {
    /**
     * All current OLED devices have a single screen. This may change in the future, introducing new zones.
     */
    GSScreenDeviceZone["ONE"] = "one";
})(GSScreenDeviceZone = exports.GSScreenDeviceZone || (exports.GSScreenDeviceZone = {}));
/**
 * The icons to use when sending an event to the SteelSeries API.
 * For previews, see {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/event-icons.md#event-icons Event Icons}
 */
var GSIcons;
(function (GSIcons) {
    GSIcons[GSIcons["NONE"] = 0] = "NONE";
    GSIcons[GSIcons["HEALTH"] = 1] = "HEALTH";
    GSIcons[GSIcons["ARMOR"] = 2] = "ARMOR";
    GSIcons[GSIcons["AMMO"] = 3] = "AMMO";
    GSIcons[GSIcons["MONEY"] = 4] = "MONEY";
    GSIcons[GSIcons["FLASHBANG"] = 5] = "FLASHBANG";
    GSIcons[GSIcons["KILLS"] = 6] = "KILLS";
    GSIcons[GSIcons["HEADSHOT"] = 7] = "HEADSHOT";
    GSIcons[GSIcons["HELMET"] = 8] = "HELMET";
    GSIcons[GSIcons["HUNGER"] = 10] = "HUNGER";
    GSIcons[GSIcons["AIR"] = 11] = "AIR";
    GSIcons[GSIcons["COMPASS"] = 12] = "COMPASS";
    GSIcons[GSIcons["TOOL"] = 13] = "TOOL";
    GSIcons[GSIcons["MANA"] = 14] = "MANA";
    GSIcons[GSIcons["CLOCK"] = 15] = "CLOCK";
    GSIcons[GSIcons["LIGHTNING"] = 16] = "LIGHTNING";
    GSIcons[GSIcons["ITEM"] = 17] = "ITEM";
    GSIcons[GSIcons["AT"] = 18] = "AT";
    GSIcons[GSIcons["MUTED"] = 19] = "MUTED";
    GSIcons[GSIcons["TALKING"] = 20] = "TALKING";
    GSIcons[GSIcons["CONNECT"] = 21] = "CONNECT";
    GSIcons[GSIcons["DISCONNECT"] = 22] = "DISCONNECT";
    GSIcons[GSIcons["MUSIC"] = 23] = "MUSIC";
    GSIcons[GSIcons["PLAY"] = 24] = "PLAY";
    GSIcons[GSIcons["PAUSE"] = 25] = "PAUSE";
    GSIcons[GSIcons["CPU"] = 27] = "CPU";
    GSIcons[GSIcons["GPU"] = 28] = "GPU";
    GSIcons[GSIcons["RAM"] = 29] = "RAM";
    GSIcons[GSIcons["ASSISTS"] = 30] = "ASSISTS";
    GSIcons[GSIcons["CREEP_SCORE"] = 31] = "CREEP_SCORE";
    GSIcons[GSIcons["DEAD"] = 32] = "DEAD";
    GSIcons[GSIcons["DRAGON"] = 33] = "DRAGON";
    GSIcons[GSIcons["ENEMIES"] = 35] = "ENEMIES";
    GSIcons[GSIcons["GAME_START"] = 36] = "GAME_START";
    GSIcons[GSIcons["GOLD"] = 37] = "GOLD";
    GSIcons[GSIcons["HEALTH_2"] = 38] = "HEALTH_2";
    GSIcons[GSIcons["KILLS_2"] = 39] = "KILLS_2";
    GSIcons[GSIcons["MANA_2"] = 40] = "MANA_2";
    GSIcons[GSIcons["TEAMMATES"] = 41] = "TEAMMATES";
    GSIcons[GSIcons["TIMER"] = 42] = "TIMER";
    GSIcons[GSIcons["TEMPERATURE"] = 43] = "TEMPERATURE";
})(GSIcons = exports.GSIcons || (exports.GSIcons = {}));
