/// <reference types="node" />
/**
 * A wrapper for the GameSense REST API.
 */
export declare class GameSense {
    options: GSOptions;
    gameOptions: GSGameOptions;
    address: string;
    windowsAddressPath: string;
    osxAddressPath: string;
    /**
     * Initializes the GameSense API. If no options are provided, the default address will be used.
     * The address is obtained automatically from the SteelSeries Engine 3 coreProps.json file.
     * This will only work on Windows and OSX.
     * @param options The options to use when initializing the GameSense API.
     */
    constructor(options: GSOptions);
    /**
     * Gets the address for the SteelSeries API.
     * If it has already been found, another request will not be made.
     * Otherwise, a request to the path of the SteelSeries Engine 3 coreProps.json file will be made.
     * This is run automatically when initializing the GameSense API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#server-discovery|Server Discovery}
     * @returns The address defined in the SteelSeries Engine 3 coreProps.json file.
     */
    getAddress(): Promise<string>;
    /**
     * Registers the game with the SteelSeries API.
     * This is run automatically when initializing the GameSense API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#registering-a-game|Registering a Game}
     */
    registerGame(): Promise<void>;
    /**
     * Register an event. This does not allow for the use of event handlers.
     * @param event The event to register.
     */
    registerEvent(event: GameSenseEvent): Promise<void>;
    /**
     * Binds a screen to an event.
     * @param event The event to bind to.
     * @param handler The screen to bind.
     */
    bindScreen(event: GameSenseEvent, handler: GSScreen): Promise<void>;
    /**
     * Used internally for sending requests to the SteelSeries API. Only use if you know what you are doing.
     * @param path The path to send the request to.
     * @param data The JSON data to send with the request.
     */
    post(path: string, data: any): Promise<void>;
}
/**
 * A wrapper for a GameSense event to send to the API.
 */
export declare class GameSenseEvent {
    options: GSEventOptions;
    gameId: string;
    eventId: string;
    minValue: number;
    maxValue: number;
    iconId: number;
    valueOptional: boolean;
    value: number;
    /**
     * Creates a new GameSense event.
     * @param options The options for the event.
     */
    constructor(options: GSEventOptions);
    /**
     * Sends the event to the SteelSeries API.
     * See {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/sending-game-events.md#event-context-data Event Context Data}
     * @param gs The GameSense API to use.
     * @param value The new value to send to the SteelSeries API.
     * @param frame [Optional] Additional context data to send. It should be a simple JSON object of key-value pairs. Values must be basic types and arrays. This data can be accessed in handlers.
     * Using `"image-data-[w]x[h]": <bitmap>` will change a bitmap screen's bitmap. (Default: undefined)
     */
    send(gs: GameSense, value: number, frame?: any): Promise<void>;
}
/**
 * A wrapper for a keyboard screen to send to the SteelSeries API.
 */
export declare class GSScreen {
    options: GSScreenOptions;
    deviceType: GSScreenDeviceType;
    zone: GSScreenDeviceZone;
    mode: string;
    datas: GSScreenFrameData[];
    bitmap?: GSScreenBitmap;
    useBitmap: boolean;
    screenSizeStr: string;
    /**
     * Creates a new GameSense screen.
     * @param options The options for the screen.
     */
    constructor(options: GSScreenOptions);
    addLine(...lines: GSScreenLine[]): void;
    removeLine(i: number): void;
    clearLines(): void;
    setLines(...lines: GSScreenLine[]): void;
    /**
     * Render the bitmap.
     * This should be called repeatedly to update the screen, otherwise it won't show up.
     * @param gs The GameSense API to use.
     * @param event The event to send.
     */
    render(gs: GameSense, event: GameSenseEvent): void;
}
export declare class GSScreenBitmap {
    bitmap: Buffer;
    width: number;
    height: number;
    constructor(width: number, height: number);
    drawPixel(x: number, y: number, on: boolean): void;
    drawLine(x1: number, y1: number, x2: number, y2: number, on: boolean): void;
    drawRect(x: number, y: number, width: number, height: number, on: boolean): void;
    getBitmap(): number[];
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
export declare enum GSScreenDeviceType {
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
    SCREEN_128x52 = "screened-128x52"
}
/**
 * The zone for a screen device. All current OLED devices have a single screen. This may change in the future, introducing new zones.
 */
export declare enum GSScreenDeviceZone {
    /**
     * All current OLED devices have a single screen. This may change in the future, introducing new zones.
     */
    ONE = "one"
}
/**
 * The icons to use when sending an event to the SteelSeries API.
 * For previews, see {@link https://github.com/SteelSeries/gamesense-sdk/blob/master/doc/api/event-icons.md#event-icons Event Icons}
 */
export declare enum GSIcons {
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
