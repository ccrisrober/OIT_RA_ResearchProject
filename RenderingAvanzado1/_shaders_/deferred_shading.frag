#version 440
out vec4 fragColor;
in vec2 outTexCoord;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gDiffuse;

struct Light {
	vec3 position;
	vec3 color;
	float c0, c1;
	float radius;
};

const int NUM_LIGHTS = 1;
uniform Light lights[NUM_LIGHTS];
uniform vec3 viewPos;

void main() {
	vec3 fragPos = texture(gPosition, outTexCoord).rgb;
    vec3 normal = texture(gNormal, outTexCoord).rgb;
    vec3 diffuse = texture(gDiffuse, outTexCoord).rgb;

	vec3 lighting = diffuse * 0.1; // Harcoded ambient component
	vec3 viewDir = normalize(viewPos - fragPos);
	for(int i = 0; i < NUM_LIGHTS; i++) {
		float dist = length(lights[i].position - fragPos);
		if(dist < lights[i].radius) {
			
		}
	}
}

