precision mediump float;

varying vec2 pos;

uniform float millis;

uniform vec2 boardSize;

const int NUM_ACTIVE_TILES_MAX = 1000;
uniform int numActiveTiles;
uniform vec2 activeTiles[NUM_ACTIVE_TILES_MAX];

// Defining colors
const vec3 red   = vec3(1., 0., 0.);
const vec3 green = vec3(0., 1., 0.);
const vec3 blue  = vec3(0., 0., 1.);
const vec3 white = vec3(1., 1., 1.);
const vec3 black = vec3(0., 0., 0.);

const vec3 cherryRed = vec3(0.6, 0., 0.06666);
const vec3 cyan = vec3 (0., 1., 1.);
const vec3 yellow = vec3(0.99607843, 0.9058823, 0.08235294);

int modulo (int a, int b)
{
    return int ( floor (float (a) - float (b) * floor ( (float (a) + 0.5) / float (b)) + 0.5) );
}

void main() {
  
    // --------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // Multi SDFs

    float bNotInsideAny = 1.;

    for(int i = 0; i < NUM_ACTIVE_TILES_MAX; i++) {

        if (i >= numActiveTiles)
            break;

        // Circle SDF
        // Calculating sdf in original pixel space (ie. of point (350, 400) ) instead of
        // distorted space of [0, 1]
        float distFromCenter = length(pos*boardSize - (activeTiles[i] + 0.5));
        float sdf = distFromCenter - 0.5;
        float bNotInside = smoothstep (0., 0.07, sdf);

        bNotInsideAny *= bNotInside;
    }
    
    // Color depending on SDF (if inside active circle)
    // and depending on time (flashing) and x position (moving)
    float timeAndPos = abs(sin (millis/600. + 4. * pos.x));
    vec3 color = (1.-bNotInsideAny) * mix(vec3 (0.17, 0.986, 1.), vec3 (0.986, 0.17, 1.), timeAndPos);
    gl_FragColor = vec4(color, 1.);

    // --------------------------------------------------------------------------------------------------------------------------------------------------------------------

}