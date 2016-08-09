#version 430
layout (early_fragment_tests) in;

#define MAX_FRAGS 100

in vec3 outPosition;
in vec3 outNormal;

vec4 LightPosition = vec4(0,0,0,1);
vec3 LightIntensity = vec3(0.9f);

uniform vec4 Kd;							// Diffuse reflectivity
vec4 Ka = vec4(vec3(0.15), 1.0);            // Ambient reflectivity

struct LLNode {
	vec4 mColor;
	float mDepth;
	uint next;
};

layout( binding = 0, r32ui) uniform uimage2D headPointers;
layout( binding = 0, offset = 0) uniform atomic_uint nextNodeCounter;
layout( binding = 0, std430 ) buffer lilit {
	LLNode nodes[];
};

uniform uint maxNodes;

layout( location = 0 ) out vec4 outColor;

subroutine void RPType();
subroutine uniform RPType RenderPass;

vec3 iluminati( ) {
	vec3 s = normalize( LightPosition.xyz - outPosition );
	vec3 n = normalize(outNormal);
	return LightIntensity * ( Ka.rgb + Kd.rgb * max( dot(s, n), 0.0 ) );
}

subroutine(RPType)
void pass1() {
	uint nodeIdx = atomicCounterIncrement(nextNodeCounter);

	if( nodeIdx < maxNodes ) {
		uint prevHead = imageAtomicExchange(headPointers, ivec2(gl_FragCoord.xy), nodeIdx);

		nodes[nodeIdx].mColor = vec4(iluminati(), Kd.a);
		nodes[nodeIdx].mDepth = gl_FragCoord.z;
		nodes[nodeIdx].next = prevHead;
	}
}

void sort(out LLNode frags[MAX_FRAGS], uint fragCount) {
	LLNode aux;
 	for(uint i = 1; i < fragCount; i++) {
		aux = frags[i];
		uint j = i;
		while(j > 0 && aux.mDepth > frags[j-1].mDepth) {
			frags[j] = frags[j-1];
			j--;
		}
		frags[j] = aux;
	}
}
vec4 finalColor(uint fragCount, out LLNode frags[MAX_FRAGS]) {
	vec4 color;
	if(fragCount > 0) {
		color = vec4(0.0, 0.0, 0.0, 1.0);
		// fragCount es el número de posiciones ocupadas en el array
		for(uint i = 0; i < fragCount; i++) {
			color = mix(color, frags[i].mColor, frags[i].mColor.a);
		}
	} else {
		color = vec4(1.0, 1.0, 1.0, 1.0);
	}
	return color;
}

subroutine(RPType)
void pass2() {
	LLNode frags[MAX_FRAGS];
	ivec2 pos = ivec2(gl_FragCoord.xy);
	uint fragCount = 0;

	uint hIdx = imageLoad(headPointers, pos).x;

	// Copy linked list to array
	// 0xffffffff is -1 value
	while( hIdx != 0xffffffff && fragCount < MAX_FRAGS ) {
		frags[fragCount] = nodes[hIdx];
		hIdx = frags[fragCount].next;
		fragCount++;
	}

	// Sort
	/*LLNode aux;
 	for(uint i = 1; i < fragCount; i++) {
		aux = frags[i];
		uint j = i;
		while(j > 0 && aux.mDepth > frags[j-1].mDepth) {
			frags[j] = frags[j-1];
			j--;
		}
		frags[j] = aux;
	}*/

	outColor = finalColor(fragCount, frags);
}

void main() {
	RenderPass();
}
