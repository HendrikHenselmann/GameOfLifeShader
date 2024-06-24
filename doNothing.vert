attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 pos;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {

    pos = aTexCoord;

    vec4 positionVec4 = vec4(aPosition, 1.0);
    gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;

}
