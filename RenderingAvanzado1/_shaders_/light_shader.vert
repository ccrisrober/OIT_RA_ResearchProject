#version 430 core

in vec3 position;

uniform mat4 mView;
uniform mat4 projection;

uniform vec3 worldPos;
uniform float radius;

void main() {
	gl_Position = vec4(1.0);//projection * mView * vec4(position
}