#version 440

uniform vec3 cameraPos;
uniform samplerCube skybox;

vec4 reflection() {
    vec3 I = normalize(Position - cameraPos);
    vec3 R = reflect(I, normalize(Normal));
    return texture(skybox, R);
}