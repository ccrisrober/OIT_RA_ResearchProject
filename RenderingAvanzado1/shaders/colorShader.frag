#version 430 core
in vec3 Pos;
in vec3 Norm;
in vec2 TexCoord;

out vec4 ocolor;
uniform vec4 color;

void main() {
	vec2 resolution = vec2(800, 600);
	vec2 position = (gl_FragCoord.xy / resolution);
	vec4 top = vec4(0, 0, 1, 1);
	vec4 bottom = vec4(1, 0, 0, 1);
	ocolor = vec4(mix(bottom, top, position.y));
    //ocolor = vec4(vec3(1, 1, 0), 1.0);
}