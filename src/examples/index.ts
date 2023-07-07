import {GameSense, GameSenseEvent, GSScreen, GSScreenDeviceType, GSScreenDeviceZone} from "../gamesense";

/**
 * Creating a new GameSense instance
 */
const gs = new GameSense({
    game: {
        gameId: 'TEST_GAME',
        gameDisplayName: 'Test Game',
        deinitializeTimerMs: 10000,
    }
});

/**
 * Register the game to the GameSense API
 */
gs.registerGame().then(() => {
    console.log('Game registered!');
});

/**
 * Creating a new event
 */
const event = new GameSenseEvent({
    gameId: gs.gameOptions.gameId,
    eventId: 'TEST_EVENT',
});

function normalScreen() {
    /**
     * Creating a new Screen instance
     * This one is a 128x40 screen for Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
     */
    const screen = new GSScreen({
        gs: gs,
        deviceType: GSScreenDeviceType.SCREEN_128x40,
        zone: GSScreenDeviceZone.ONE,
    });

    /**
     * Adding lines to the screen
     * This one is text that says "Test 1: <value>"
     */
    screen.addLine({
        "has-text": true,
        prefix: 'Test 1: ',
    });

    /**
     * Adding lines to the screen
     * This one is a progress bar
     */
    screen.addLine({
        "has-progress-bar": true,
        "has-text": false,
    });

    /**
     * Bind the screen to the event
     */
    gs.bindScreen(event, screen).then(() => {
        console.log('Screen binded!');
    });

    /**
     * Send the event to the GameSense API with a value increasing from 0 to 100
     */
    let i = 0;
    setInterval(() => {
        event.send(gs, i);
        i++;
        if (i > 100) {
            i = 0;
        }
    }, 100);
}

function bitmapScreen() {
    /**
     * Creating a new Screen instance
     * But with useBitmap set to true
     */
    const screen = new GSScreen({
        gs: gs,
        deviceType: GSScreenDeviceType.SCREEN_128x40,
        zone: GSScreenDeviceZone.ONE,
        useBitmap: true,
    });

    /**
     * Bind the screen to the event
     */
    gs.bindScreen(event, screen).then(() => {
        console.log('Screen binded!');

        /**
         * Draw a rectangle on the screen
         * This one is a 10x10 rectangle at (10, 10)
         */
        screen.bitmap?.drawRect(10, 10, 20, 10, true);

        /**
         * Render the bitmap.
         * Must be done only after the screen is binded.
         */
        screen.render(gs, event);
    });
}

// Uncomment one of these to test
// normalScreen()
// bitmapScreen()