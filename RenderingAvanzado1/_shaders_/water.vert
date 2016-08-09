#version 440
layout (location = 0) in vec3 position;

out vec2 TexCoords;
out vec4 ProjTexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform mat4 ProjectorMatrix;

void main() {
    gl_Position = projection * view * model * vec4(position, 1.0f);
	ProjTexCoord = ProjectorMatrix * (model * vec4(position, 1.0));
}