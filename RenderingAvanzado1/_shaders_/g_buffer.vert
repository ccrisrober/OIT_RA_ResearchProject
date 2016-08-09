#version 440
layout(location = 0) in vec3 position;
layout(location = 1) in vec3 normal;
layout(location = 2) in vec2 texCoords;

out vec3 outPosition;
out vec2 outTexCoord;
out vec3 outNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
	vec4 worldPos = model * vec4(position, 1.0f);
	outPosition = worldPos.xyz;
	gl_Position = projection * view * worldPos;
	outTexCoord = texCoords;
	mat3 normalMatrix = transpose(inverse(mat3(model)));
	outNormal = normalMatrix * normal;
}