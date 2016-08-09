#version 430
layout (early_fragment_tests) in;

#define MAX_FRAGMENTS 100

in vec3 Position;
in vec3 Normal;

vec4 LightPosition = vec4(0,0,0,1);
vec3 LightIntensity = vec3(0.9f);

uniform vec4 Kd;					// Diffuse reflectivity
vec4 Ka = vec4(vec3(0.15), 1.0);    // Ambient reflectivity

struct NodeType {
	vec4 color;
	float depth;
	uint next;
};

layout( binding = 0, r32ui) uniform uimage2D headPointers;
layout( binding = 0, offset = 0) uniform atomic_uint nextNodeCounter;
layout( binding = 0, std430 ) buffer lilit {
	NodeType nodes[];
};

uniform uint maxNodes;

layout( location = 0 ) out vec4 FragColor;

subroutine void RenderPassType();
subroutine uniform RenderPassType RenderPass;

vec3 diffuse( ) {
	vec3 s = normalize( LightPosition.xyz - Position );
	vec3 n = normalize(Normal);
	return LightIntensity * ( Ka.rgb + Kd.rgb * max( dot(s, n), 0.0 ) );
}

subroutine(RenderPassType) void pass1() {
	uint nodeIdx = atomicCounterIncrement(nextNodeCounter);

	if( nodeIdx < maxNodes ) {
		uint prevHead = imageAtomicExchange(headPointers, ivec2(gl_FragCoord.xy), nodeIdx);

		nodes[nodeIdx].color = vec4(diffuse(), Kd.a);
		nodes[nodeIdx].depth = gl_FragCoord.z;
		nodes[nodeIdx].next = prevHead;
	}
}

subroutine(RenderPassType) void pass2() {
	NodeType frags[MAX_FRAGMENTS];
	int count = 0;

	uint n = imageLoad(headPointers, ivec2(gl_FragCoord.xy)).r;
	
	while( n != 0xffffffff && count < MAX_FRAGMENTS) {
		frags[count] = nodes[n];
		n = frags[count].next;
		count++;
	}

	for( uint i = 1; i < count; i++ ) {
		NodeType toInsert = frags[i];
		uint j = i;
		while( j > 0 && toInsert.depth > frags[j-1].depth ) {
			frags[j] = frags[j-1];
			j--;
		}
		frags[j] = toInsert;
	}

	vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
	for( int i = 0; i < count; i++ ) {
		color = mix( color, frags[i].color, frags[i].color.a);
	}

	FragColor = color;
}

void main() {
	RenderPass();
}
