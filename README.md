# GameOfLifeShader
Game of life with (little) game logic written in JavaScript. Drawing nothing but a single Rectangle with JavaScript. The whole graphics part is implemented in the fragment shader. Project to learn about shaders. The downside of this approach is the limited input size of the fragment shader. Therefore, there is an upper limit on active tiles, which is currently at 1000 tiles.

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
