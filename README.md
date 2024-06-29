# GameOfLifeShader
An implementation of Conways Game of Life. The (little) game logic is written in JavaScript. No graphics object is created with JavaScript except a single Rectangle, representing the background canvas. The whole graphics part is implemented in the fragment shader. This is a small project to learn about shaders. The downside of this approach is the limited input size of the fragment shader. Therefore, there is an upper limit on active tiles, which is currently at 1000 tiles.

# Time Complexity
The fragment shader calculates the desired color of every pixel of a frame. Therefore the signed distance of a pixel (SDF) to every active game tile is evaluated. Resulting in a time complexity that depends on the size of the browser window's pixels (p) and the number of active game tiles (a): O (p * a).

# Examples

Low framerate, because it's a GIF.

![](https://github.com/HendrikHenselmann/GameOfLifeShader/blob/main/GameOfLife.gif)


# Controls

| Action / Key | Effect |
| ------------- | ------------- |
| Click  | Activate / Deactivate the targeted tile.  |
| Click and move cursor | Activate inactive tiles / Deactivate active tiles when hovered over.  |
| Mouse wheel | Increase / Decrease the number of displayed tiles. |
| P | Play / Pause simulation. |
| C | Clear all active tiles.  |
| I | Invert all tiles. Active ones become inactive and vice versa. |
| S | Downloads a ".txt" file, that stores the positions of the currently active tiles. Replace the "initialGameState.txt" file in the project with the downloaded one to be able to reload it. |
| L | Load the active tiles stored in the project's "initialGameState.txt" file. |
