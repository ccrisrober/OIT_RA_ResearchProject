#version 440

uniform vec3 cameraPos;
uniform samplerCube skybox;

vec4 refraction(float m) {
	float ratio = 1.0/m;
	vec3 I = normalize(Position - cameraPos);
	vec3 R = refract(I, normalize(Normal), ratio);
	return texture(skybox, R);
}