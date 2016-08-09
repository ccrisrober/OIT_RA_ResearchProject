#version 440
layout(location = 0) out vec3 gPosition;
layout(location = 1) out vec3 gNormal;
layout(location = 2) out vec4 gDiffuse;

in vec2 outTexCoord;
in vec3 outPosition;
in vec3 outNormal;

uniform sampler2D texture_diffuse;

void main() {
	gPosition = outPosition;
	gNormal = normalize(outNormal);
	gDiffuse = texture(texture_diffuse, outTexCoord);
	// La especular también estaría bien ... gDiffuse.a = texture(texture_specular1, TexCoords).r;
}