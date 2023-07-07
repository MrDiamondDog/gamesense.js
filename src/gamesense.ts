import * as fs from "fs";
import * as http from "http";

/**
 * A wrapper for the GameSense REST API.
 */
export class GameSense {
    public options: GSOptions;
    public gameOptions: GSGameOptions;
    public address: string;

    public windowsAddressPath: string =
        "C:/ProgramData/SteelSeries/SteelSeries Engine 3/coreProps.json";
    public osxAddressPath: string =
        "/Library/Application Support/SteelSeries Engine 3/coreProps.json";

    /**
     * Initializes the GameSense API. If no options are provided, the default address will be used.
     * The address is obtained automatically from the SteelSeries Engine 3 coreProps.json file.
     * This will only work on Windows and OSX.
     * @param options The options to use when initializing the GameSense API.
     */
    constructor(options: GSOptions) {
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
        } else {
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
    public async getAddress(): Promise<string> {
        if (this.address) {
            return new Promise((resolve) => resolve(this.address));
        }
        return new Promise((resolve, reject) => {
            if (process.platform === "win32") {
                const data = fs.readFileSync(this.windowsAddressPath, "utf8");
                const json = JSON.parse(data);
                this.address = json.address;
                resolve(json.address);
            } else if (process.platform === "darwin") {
                const data = fs.readFileSync(this.osxAddressPath, "utf8");
                const json = JSON.parse(data);
                this.address = json.address;
                resolve(json.address);
            } else {
                reject("Unsupported platform (Windows and OSX only)");
            }
        });
    }

    /**
     * Registers the game with the SteelSeries API.
     * This is run automatically when initializing the GameSense API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#registering-a-game|Registering a Game}
     */
    public async registerGame(): Promise<void> {
        return new Promise((resolve, reject) => {
            const data = {
                game: this.gameOptions.gameId,
                game_display_name: this.gameOptions.gameDisplayName,
                developer: this.gameOptions.developer,
                deinitialize_timer_length_ms: this.gameOptions.deinitializeTimerMs
            };

            this.post("/game_metadata", data)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Register an event. This does not allow for the use of event handlers.
     * @param event The event to register.
     */
    public async registerEvent(event: GameSenseEvent): Promise<void> {
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
    }

    /**
     * Binds a screen to an event.
     * @param event The event to bind to.
     * @param handler The screen to bind.
     */
    public async bindScreen(event: GameSenseEvent, handler: GSScreen): Promise<void> {
        return new Promise((resolve, reject) => {
            const data = {
                game: event.gameId,
                event: event.eventId,
                min_value: event.minValue,
                max_value: event.maxValue,
                icon_id: event.iconId,
                value_optional: event.valueOptional,
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
    }

    /**
     * Used internally for sending requests to the SteelSeries API. Only use if you know what you are doing.
     * @param path The path to send the request to.
     * @param data The JSON data to send with the request.
     */
    public async post(path: string, data: any): Promise<void> {
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
                } else {
                    resolve();
                }
            });

            req.on("error", (err) => {
                reject(err);
            });

            req.write(JSON.stringify(data));
            req.end();
        });
    }
}

/**
 * A wrapper for a GameSense event to send to the API.
 */
export class GameSenseEvent {
    public options: GSEventOptions;

    public gameId: string;
    public eventId: string;
    public minValue: number;
    public maxValue: number;
    public iconId: number;
    public valueOptional: boolean;

    public value: number = 0;

    /**
     * Creates a new GameSense event.
     * @param options The options for the event.
     */
    constructor(options: GSEventOptions) {
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
     * @param frame [Optional] Additional context data to send. It should be a simple JSON object of key-value pairs. Values must be basic types and arrays. This data can be accessed in handlers.
     * Using `"image-data-[w]x[h]": <bitmap>` will change a bitmap screen's bitmap. (Default: undefined)
     */
    public async send(gs: GameSense, value: number, frame?: any): Promise<void> {
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
    }
}

/**
 * A wrapper for a keyboard screen to send to the SteelSeries API.
 */
export class GSScreen {
    public options: GSScreenOptions;

    public deviceType: GSScreenDeviceType;
    public zone: GSScreenDeviceZone;
    public mode = "screen";
    public datas: GSScreenFrameData[] = [];
    public bitmap?: GSScreenBitmap;
    public useBitmap = false;
    public screenSizeStr: string = "";

    /**
     * Creates a new GameSense screen.
     * @param options The options for the screen.
     */
    constructor(options: GSScreenOptions) {
        this.options = options;

        this.deviceType = options.deviceType;
        this.zone = options.zone;
        this.useBitmap = options.useBitmap || false;

        if (this.deviceType == GSScreenDeviceType.SCREEN_128x40) {
            this.screenSizeStr = "128x40";
        } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x52) {
            this.screenSizeStr = "128x52";
        } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x36) {
            this.screenSizeStr = "128x36";
        } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x48) {
            this.screenSizeStr = "128x48";
        }

        if (this.useBitmap) {
            if (this.deviceType == GSScreenDeviceType.SCREEN_128x40) {
                this.bitmap = new GSScreenBitmap(128, 40);
            } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x52) {
                this.bitmap = new GSScreenBitmap(128, 52);
            } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x36) {
                this.bitmap = new GSScreenBitmap(128, 36);
            } else if (this.deviceType == GSScreenDeviceType.SCREEN_128x48) {
                this.bitmap = new GSScreenBitmap(128, 48);
            }

            this.datas = [
                {
                    "has-text": false,
                    "image-data": this.bitmap?.getBitmap()
                }
            ];
        }
    }

    public addLine(...lines: GSScreenLine[]): void {
        if (this.useBitmap) return;
        if (this.datas[0]) {
            for (const l of lines) {
                if (!this.datas[0].lines) this.datas[0].lines = [];
                this.datas[0].lines.push(l);
            }
        } else {
            this.datas.push({
                lines: lines
            });
        }
    }

    public removeLine(i: number): void {
        if (this.useBitmap) return;
        if (this.datas[0]) {
            if (!this.datas[0].lines) return;
            this.datas[0].lines.splice(i, 1);
        }
    }

    public clearLines(): void {
        if (this.useBitmap) return;
        if (this.datas[0]) {
            this.datas[0].lines = [];
        }
    }

    public setLines(...lines: GSScreenLine[]): void {
        if (this.useBitmap) return;
        if (this.datas[0]) {
            this.datas[0].lines = lines;
        } else {
            this.datas.push({
                lines: lines
            });
        }
    }

    /**
     * Render the bitmap. Only should be used if `useBitmap` is true.
     * @param gs The GameSense API to use.
     * @param event The event to send.
     */
    public render(gs: GameSense, event: GameSenseEvent) {
        if (!this.useBitmap) return;
        event.send(gs, event.value, {
            ["image-data-" + this.screenSizeStr]: this.bitmap?.getBitmap(),
        });
    }
}

export class GSScreenBitmap {
    public bitmap: Buffer;
    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.bitmap = Buffer.alloc(width * height / 8);
    }

    /**
     * Draws a pixel on the bitmap.
     * @param x The X coordinate.
     * @param y The Y coordinate.
     * @param on Whether to turn the pixel on or off.
     */
    public drawPixel(x: number, y: number, on: boolean): void {
        const byteIndex = y * Math.ceil(this.width / 8) + Math.floor(x / 8);
        const bitOffset = 7 - (x % 8);

        if (on) {
            this.bitmap[byteIndex] |= (1 << bitOffset);
        } else {
            this.bitmap[byteIndex] &= ~(1 << bitOffset);
        }
    }

    /**
     * Draws a line on the bitmap.
     * @param x1 The starting X coordinate.
     * @param y1 The starting Y coordinate.
     * @param x2 The ending X coordinate.
     * @param y2 The ending Y coordinate.
     * @param on Whether to turn the pixels on or off.
     */
    public drawLine(x1: number, y1: number, x2: number, y2: number, on: boolean): void {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.drawPixel(x1, y1, on);
            if ((x1 == x2) && (y1 == y2)) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    /**
     * Draw a rectangle on the bitmap.
     * @param x The x position of the rectangle.
     * @param y The y position of the rectangle.
     * @param width The width of the rectangle.
     * @param height The height of the rectangle.
     * @param on Whether the rectangle should be on or off.
     */
    public drawRect(x: number, y: number, width: number, height: number, on: boolean): void {
        for (let i = x; i < x + width; i++) {
            for (let j = y; j < y + height; j++) {
                this.drawPixel(i, j, on);
            }
        }
    }

    /**
     * Gets the bitmap as an array of numbers.
     */
    public getBitmap(): number[] {
        const arr: number[] = [];
        for (let i = 0; i < this.bitmap.length; i++) {
            arr.push(this.bitmap.readUInt8(i));
        }
        return arr;
    }
}

/**
 * The options to use when initializing the GameSense API.
 * @param game The game information to use when initializing the GameSense API.
 * @param developer [Optional] The developer of the game. (Default: undefined)
 * @param address [Optional] The address to use when initializing the GameSense API. (Default: The address obtained from the SteelSeries Engine 3 coreProps.json file)
 * @param windowsAddressPath [Optional] The path to the SteelSeries Engine 3 coreProps.json file on Windows. (Default: C:/ProgramData/SteelSeries/SteelSeries Engine 3/coreProps.json)
 * @param osxAddressPath [Optional] The path to the SteelSeries Engine 3 coreProps.json file on OSX. (Default: /Library/Application Support/SteelSeries Engine 3/coreProps.json)
 */
export interface GSOptions {
    game: GSGameOptions;
    address?: string;
    windowsAddressPath?: string;
    osxAddressPath?: string;
}

/**
 * The game information to use when initializing the GameSense API.
 * @param gameId The id of the game, e.g. "TEST_GAME". (Only capital letters, numbers, hyphens, and underscores)
 * @param deinitializeTimerMs [Optional] The time in milliseconds to wait before deinitializing the GameSense API. (Default: 15000)
 * @param gameDisplayName [Optional] The display name of the game. (Default: gameName)
 * @param developer [Optional] The developer of the game.
 */
export interface GSGameOptions {
    gameId: string;
    deinitializeTimerMs?: number;
    gameDisplayName?: string;
    developer?: string;
}

/**
 * The options to use when sending an event to the SteelSeries API.
 * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#registering-an-event Registering an Event}
 * @param gameId The id of the game, e.g. "TEST_GAME". (Only capital letters, numbers, hyphens, and underscores)
 * @param eventId The id of the event, e.g. "HEALTH". (Only capital letters, numbers, hyphens, and underscores)
 * @param minValue [Optional] The minimum value of the event. (Default: 0)
 * @param maxValue [Optional] The maximum value of the event. (Default: 100)
 * @param icon [Optional] The GSIcon icon to display for the event. (Default: GSIcons.NONE)
 * @param valueOptional [Optional] Whether the value of the event is optional or not. (Default: false)
 */
export interface GSEventOptions {
    gameId: string;
    eventId: string;
    minValue?: number;
    maxValue?: number;
    icon?: number;
    valueOptional?: boolean;
}

/**
 * The options to use when using a screen device.
 * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/json-handlers-screen.md JSON Screen Handlers}
 * @param gs The GameSense API to use.
 * @param deviceType The type of device to use.
 * @param zone The zone of the device to use.
 * @param useBitmap [Optional] Whether to use a bitmap or not. (Default: false)
 */
export interface GSScreenOptions {
    gs: GameSense;
    deviceType: GSScreenDeviceType;
    zone: GSScreenDeviceZone;
    useBitmap?: boolean;
}

/**
 * The options to use when using a screen device.
 * @param lines The lines to use.
 * @param has-text [Optional] Whether the screen has text or not. (Default: undefined)
 * @param image-data [Optional] The image data to use. (Default: undefined)
 */
export interface GSScreenFrameData {
    lines?: GSScreenLine[];
    "has-text"?: boolean;
    "image-data"?: number[];
}

/**
 * A line on a screen device.
 * @param has-text Whether the line has text or not.
 * @param has-progress-bar [Optional] Whether the line has a progress bar or not. (Default: false)
 * @param prefix [Optional] The prefix of the line. (Default: undefined)
 * @param suffix [Optional] The suffix of the line. (Default: undefined)
 * @param bold [Optional] Whether the line is bold or not. (Default: false)
 * @param wrap [Optional] Whether the line wraps or not. (Default: false)
 * @param arg [Optional] The argument of the line. (Default: undefined)
 * @param context-frame-key [Optional] Used for modifying this line from an event. (Default: undefined)
 */
export interface GSScreenLine {
    "has-text": boolean;
    "has-progress-bar"?: boolean;
    prefix?: string;
    suffix?: string;
    bold?: boolean;
    wrap?: boolean;
    arg?: string;
    "context-frame-key"?: string;
}

/**
 * The device type for a screen device.
 * @param SCREEN_128x36 Rival 700, Rival 710
 * @param SCREEN_128x40 Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
 * @param SCREEN_128x48 Arctis Pro Wireless
 * @param SCREEN_128x52 GameDAC / Arctis Pro + GameDAC
 * @param SCREEN Any
 */
export enum GSScreenDeviceType {
    /**
     * Rival 700, Rival 710
     */
    SCREEN_128x36 = "screened-128x36",
    /**
     * Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
     */
    SCREEN_128x40 = "screened-128x40",
    /**
     * Arctis Pro Wireless
     */
    SCREEN_128x48 = "screened-128x48",
    /**
     * GameDAC / Arctis Pro + GameDAC
     */
    SCREEN_128x52 = "screened-128x52",
}

/**
 * The zone for a screen device. All current OLED devices have a single screen. This may change in the future, introducing new zones.
 */
export enum GSScreenDeviceZone {
    /**
     * All current OLED devices have a single screen. This may change in the future, introducing new zones.
     */
    ONE = "one"
}

/**
 * The icons to use when sending an event to the SteelSeries API.
 * For previews, see {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/event-icons.md#event-icons Event Icons}
 */
export enum GSIcons {
    NONE = 0,
    HEALTH = 1,
    ARMOR = 2,
    AMMO = 3,
    MONEY = 4,
    FLASHBANG = 5,
    KILLS = 6,
    HEADSHOT = 7,
    HELMET = 8,
    HUNGER = 10,
    AIR = 11,
    COMPASS = 12,
    TOOL = 13,
    MANA = 14,
    CLOCK = 15,
    LIGHTNING = 16,
    ITEM = 17,
    AT = 18,
    MUTED = 19,
    TALKING = 20,
    CONNECT = 21,
    DISCONNECT = 22,
    MUSIC = 23,
    PLAY = 24,
    PAUSE = 25,
    CPU = 27,
    GPU = 28,
    RAM = 29,
    ASSISTS = 30,
    CREEP_SCORE = 31,
    DEAD = 32,
    DRAGON = 33,
    ENEMIES = 35,
    GAME_START = 36,
    GOLD = 37,
    HEALTH_2 = 38,
    KILLS_2 = 39,
    MANA_2 = 40,
    TEAMMATES = 41,
    TIMER = 42,
    TEMPERATURE = 43
}
