// ================================================================================================================================================

let gameShader;

const initialTileSize = 30;
let tileSize;
let boardSize;
let maxBoardSizeTillNow;

// Track which tiles are active
// Limit of the activeTiles is NUM_ACTIVE_TILES in "canvas.frag" fragment shader
let activeTiles;

let userIsDrawing;        // Is the user currently drawing? mousedown and no mouseup yet?
let currentTile;          // The tile that the cursor is currently at

const stepsPerSecond = 6;
let lastStepTime;         // Time when last game update step happened (in ms)
let isGameRunning;
const isRunningStepByStep = false;

let newActiveTiles;  // Dirty workaround

// ================================================================================================================================================

class ObjectSet extends Set {
    add (elem) {
        return super.add(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    delete (elem) {
        return super.delete(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    has (elem) {
        return super.has(typeof elem === 'object' ? JSON.stringify(elem) : elem);
    }
    toArray () {
        return Array.from(this).map(JSON.parse);
    }
}

class ObjectMap extends Map {
    get (key) {
        return super.get(typeof key === 'object' ? JSON.stringify(key) : key);
    }
    set (key, val) {
        return super.set(typeof key === 'object' ? JSON.stringify(key) : key, val);
    }
    has (key) {
        return super.has(typeof key === 'object' ? JSON.stringify(key) : key);
    }
    forEach (callback) {
        for (const key of super.keys ()) {
            if (typeof key === 'string')
                callback (JSON.parse (key), this.get (key));
            else
                callback (key, super.get (key));
        }
    }
}

// Mapping pixel coordinates to x and y ids of tiles
function pixelCoordToTileCoord (pixelCoords)
{
    return [
        floor(pixelCoords[0] / tileSize),
        floor(pixelCoords[1] / tileSize)
    ];
}

// ================================================================================================================================================

// Ad / Remove the tile that was clicked on to / from the activeTiles set
function activateOrDeactivateTile (event) {

    if (!userIsDrawing) return;

    const mouseTileCoords = pixelCoordToTileCoord ([event.clientX, event.clientY]);

    if (currentTile && mouseTileCoords[0] == currentTile[0] && mouseTileCoords[1] == currentTile[1])
        return;

    currentTile = mouseTileCoords;

    if (activeTiles.has(mouseTileCoords))
        activeTiles.delete (mouseTileCoords);
    else
        activeTiles.add (mouseTileCoords);
}

function checkKeyPressed (event)
{
    if (event.code == "KeyS")       // Save
        saveGameStateFile();
    else if (event.code == "KeyL")  // Load
        loadGameStateFile ();
    else if (event.code == "KeyC")  // Clear
        activeTiles.clear();
    else if (event.code == "KeyP")  // Play
        isGameRunning = isGameRunning ? false : true;
    else if (event.code == "KeyI")  // Invert
        invertGameState();
    // else
        // alert("No function invoked on that key press!");
}

function saveGameStateFile ()
{

    var text = Array.from(activeTiles).join("|"),
        blob = new Blob([text], { type: 'text/plain' }),
        anchor = document.createElement('a');

    anchor.download = "initialGameState.txt";
    anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
    anchor.dataset.downloadurl = ['text/plain', anchor.download, anchor.href].join(':');
    anchor.click();

}

function loadGameStateFile ()
{
    var client = new XMLHttpRequest();
    client.open('GET', '/initialGameState.txt');
    client.onloadend = function() {
        activeTiles = new ObjectSet (client.responseText.split("|").map(JSON.parse));
    }
    client.send();
}

// ================================================================================================================================================

function isOnBoard ([tileCoordX, tileCoordY])
{
    return 0 <= tileCoordX && tileCoordX < boardSize[0] &&
           0 <= tileCoordY && tileCoordY < boardSize[1];
}

function gameOfLifeApplyRules ()
{
    // Loop over all active tiles (instead of over the whole board)
    // Add 1 to every adjacent tile
    const numAdjacentTiles = new ObjectMap ();
    for (const [x, y] of activeTiles.toArray())
    {

        for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]])
        {
            const newTile = [x+dx, y+dy];
            if (!isOnBoard (newTile))
                continue;

            let oldVal = 0;
            if (numAdjacentTiles.has (newTile))
                oldVal = numAdjacentTiles.get (newTile);

            numAdjacentTiles.set (newTile, oldVal+1);               
        }
    }

    // numAdjacentTiles.forEach ( ([x, y], neighbors) => {
    //     console.log ("(", x, ", ", y, ") : ", neighbors);
    // });

    // Loop over all tiles with at least one neighbor
    newActiveTiles = new ObjectSet ();
    numAdjacentTiles.forEach (
        ([x, y], neighbors) => {
            if (activeTiles.has ([x, y]) && (2 <= neighbors && neighbors <= 3))
                newActiveTiles.add ([x, y]);
            else if (!activeTiles.has ([x, y]) && neighbors == 3)
                newActiveTiles.add ([x, y]);
        }
    );

    // Set new active tiles
    activeTiles = newActiveTiles;
}

function invertGameState ()
{
    newActiveTiles = new ObjectSet ();
    for (let x = 0; x < maxBoardSizeTillNow[0]; x++)
    {
        for (let y = 0; y < maxBoardSizeTillNow[1]; y++)
        {
            if (!activeTiles.has ([x, y]))
                newActiveTiles.add ([x, y]);
        }
    }
    activeTiles = newActiveTiles;
}

// ================================================================================================================================================
// Update boardSize according to current tileSize and window size
function updateBoardSize ()
{
    boardSize = [window.innerWidth / tileSize, window.innerHeight / tileSize];
    maxBoardSizeTillNow = boardSize[0] > maxBoardSizeTillNow[0] ? boardSize : maxBoardSizeTillNow;
}

function preload() {
    // load in the shader
    gameShader = loadShader("doNothing.vert", "flashingCircles.frag");
}

function setup() {

    document.addEventListener("mousedown", (event) => {console.log("Clicked on ( ", event.clientX, ", ", event.clientY, " )"); userIsDrawing = true; currentTile = null; activateOrDeactivateTile (event);});
    document.addEventListener("mouseup", () => {userIsDrawing = false;});
    document.addEventListener("mousemove", activateOrDeactivateTile);
    document.addEventListener("keydown", checkKeyPressed, false);
    document.addEventListener("wheel", (event) => {tileSize += event.deltaY / window.innerHeight; updateBoardSize(); console.log("deltaY: ", event.deltaY); console.log("New tileSize: ", tileSize);})

    createCanvas(window.innerWidth, window.innerHeight, WEBGL);

    shader(gameShader);

    tileSize = initialTileSize;
    maxBoardSizeTillNow = [0, 0];
    updateBoardSize ();

    // gameShader.setUniform("tileSize", tileSize);

    activeTiles = new ObjectSet();
    newActiveTiles = new ObjectSet ();

    lastStepTime = millis();

    isGameRunning = false;

    loadGameStateFile ();
}

function draw() {

    if (isGameRunning && millis () - lastStepTime >= 1000. / stepsPerSecond)
    {
        lastStepTime = millis ();
        gameOfLifeApplyRules ();
    }

    if (isRunningStepByStep && isGameRunning)
        isGameRunning = false;

    // Get the time
    gameShader.setUniform("millis", millis());
    gameShader.setUniform("numActiveTiles", activeTiles.size);
    gameShader.setUniform("activeTiles", activeTiles.toArray().flat());
    gameShader.setUniform("boardSize", boardSize);

    // The game board is one big rectangle that covers the whole screen
    rect(-width/2, -height/2, width, height);


}

// ================================================================================================================================================
