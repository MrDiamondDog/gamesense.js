import {GameSense, GameSenseEvent, GSScreen, GSScreenDeviceType, GSScreenDeviceZone} from "../gamesense";

/**
 * Creating a new GameSense instance
 */
const gs = new GameSense({
    game: {
        gameId: 'TEST_GAME',
        gameDisplayName: 'Test Game',
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

/**
 * Creating a new Screen instance
 * This one is a 128x40 screen for Apex 7, Apex 7 TKL, Apex Pro, Apex Pro TKL
 */
const screen = new GSScreen({
    gs: gs,
    deviceType: GSScreenDeviceType.SCREEN_128x40,
    zone: GSScreenDeviceZone.ONE
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

let i = 0;

/**
 * Sends the event every 100ms with a different value
 */
function loop() {
    event.send(gs, i).then(() =>
        console.log('Event sent! ' + event.value)
    ).catch((err) =>
        console.error(err)
    );
    i++;
    if (i > 100) {
        i = 0;
    }
}

setInterval(loop, 100);