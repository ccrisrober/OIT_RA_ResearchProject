#version 440
layout (location = 0) in vec3 position;
layout (location = 1) in vec2 texCoord;

out vec2 TexCoords;
out vec3 OutPos;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
    gl_Position = projection * view * model * vec4(position, 1.0f);
    TexCoords = texCoord;
	OutPos = vec3(model * vec4(position, 1.0));
}