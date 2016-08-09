#version 430 core
layout(location = 0) in vec3 inPos;
layout(location = 1) in vec3 inNormal;
layout(location = 2) in vec2 inTexCoord;

out vec3 Pos;
out vec3 Norm;
out vec2 TexCoord;

uniform mat4 normal;
uniform mat4 modelView;
uniform mat4 modelViewProj;

void main() {
	Pos = vec3(modelView * vec4(inPos, 1.0));
	Norm = normalize( vec3(normal * vec4(inNormal,0.0)) );
	TexCoord = inTexCoord;
    gl_Position = modelViewProj * vec4(inPos, 1.0f);
}