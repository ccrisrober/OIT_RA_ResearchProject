#version 440
out vec4 color_;
uniform sampler2D unit_wave;
uniform sampler2D unit_wave2;
in vec2 TexCoords;
in vec3 OutPos;
const vec2 size = vec2(1,0.0);
const ivec3 off = ivec3(-1,0,1);

void main() {    
	vec4 wave = texture(unit_wave, TexCoords);
    float s11 = wave.x;
    float s01 = textureOffset(unit_wave, TexCoords, off.xy).x;
    float s21 = textureOffset(unit_wave, TexCoords, off.zy).x;
    float s10 = textureOffset(unit_wave, TexCoords, off.yx).x;
    float s12 = textureOffset(unit_wave, TexCoords, off.yz).x;
    vec3 va = normalize(vec3(size.xy,s21-s01));
    vec3 vb = normalize(vec3(size.yx,s12-s10));
    vec4 bump = vec4( cross(va,vb), s11 );         
    color_ = bump;

	vec3 lightPos = vec3(-8, 0, 0);
	vec3 normal = normalize(bump.rgb * 2.0 - 1.0);   
     // Get diffuse color
    vec3 color = texture(unit_wave2, TexCoords).rgb;
    // Ambient
    vec3 ambient = 0.1 * color;
    // Diffuse
    vec3 lightDir = normalize(lightPos - OutPos);
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * color;

	color_ = vec4(ambient + diffuse, 1.0f);
	//color = mix(color, texture(unit_wave2, TexCoords), 0.6);
}




/*
#version 440
out vec4 fragColor;
#define NUM_CELLS	10.0
#define TILES 		2.0	
in vec2 TexCoords;

vec2 Hash2(vec2 p) {
	float r = 923.0*sin(dot(p, vec2(68.3158, 13.6143)));
	return vec2(fract(5.32354 * r), fract(97.25865 * r));
}

float Cells(in vec2 p, in float numCells) {
	p *= numCells;
	float d = 1.0e10;
	for (int xo = -1; xo <= 1; xo++) {
		for (int yo = -1; yo <= 1; yo++) {
			vec2 tp = floor(p) + vec2(xo, yo);
			tp = p - tp - Hash2(mod(tp, numCells / TILES));
			d = min(d, dot(tp, tp));
		}
	}
	return sqrt(d);
}
void main() {
	fragColor = vec4(vec3(Cells(TexCoords, NUM_CELLS)), 1.0);
}*/



/*#version 440
out vec4 color;
uniform sampler2D unit_wave;
uniform sampler2D unit_wave2;
in vec2 TexCoords;
const vec2 size = vec2(1.0,0.0);
const ivec3 off = ivec3(-1,0,1);

void main() {    
	vec4 wave = texture(unit_wave, TexCoords);
    float s11 = wave.x;
    float s01 = textureOffset(unit_wave, TexCoords, off.xy).x;
    float s21 = textureOffset(unit_wave, TexCoords, off.zy).x;
    float s10 = textureOffset(unit_wave, TexCoords, off.yx).x;
    float s12 = textureOffset(unit_wave, TexCoords, off.yz).x;
    vec3 va = normalize(vec3(size.xy,s21-s01));
    vec3 vb = normalize(vec3(size.yx,s12-s10));
    vec4 bump = vec4( cross(va,vb), s11 );         
    color = bump;
	//color = mix(color, texture(unit_wave2, TexCoords), 0.6);
}*/











/*
vec3 permute(vec3 x) {
	return mod((34.0 * x + 1.0) * x, 289.0);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Standard 3x3 search window for good F1 and F2 values
vec2 cellular(vec2 P) {
#define K 0.142857142857 // 1/7
#define Ko 0.428571428571 // 3/7
#define jitter 1.0 // Less gives more regular pattern
	vec2 Pi = mod(floor(P), 289.0);
 	vec2 Pf = fract(P);
	vec3 oi = vec3(-1.0, 0.0, 1.0);
	vec3 of = vec3(-0.5, 0.5, 1.5);
	vec3 px = permute(Pi.x + oi);
	vec3 p = permute(px.x + Pi.y + oi); // p11, p12, p13
	vec3 ox = fract(p*K) - Ko;
	vec3 oy = mod(floor(p*K),7.0)*K - Ko;
	vec3 dx = Pf.x + 0.5 + jitter*ox;
	vec3 dy = Pf.y - of + jitter*oy;
	vec3 d1 = dx * dx + dy * dy; // d11, d12 and d13, squared
	p = permute(px.y + Pi.y + oi); // p21, p22, p23
	ox = fract(p*K) - Ko;
	oy = mod(floor(p*K),7.0)*K - Ko;
	dx = Pf.x - 0.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
	p = permute(px.z + Pi.y + oi); // p31, p32, p33
	ox = fract(p*K) - Ko;
	oy = mod(floor(p*K),7.0)*K - Ko;
	dx = Pf.x - 1.5 + jitter*ox;
	dy = Pf.y - of + jitter*oy;
	vec3 d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
	// Sort out the two smallest distances (F1, F2)
	vec3 d1a = min(d1, d2);
	d2 = max(d1, d2); // Swap to keep candidates for F2
	d2 = min(d2, d3); // neither F1 nor F2 are now in d3
	d1 = min(d1a, d2); // F1 is now in d1
	d2 = max(d1a, d2); // Swap to keep candidates for F2
	d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
	d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
	d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
	d1.y = min(d1.y, d1.z); // nor in  d1.z
	d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
	return sqrt(d1.xy);
}
void main(void) {
	vec2 F = cellular(TexCoords.xy*50.0);
	float facets = 0.1+(F.y-F.x);
	//float dots = smoothstep(0.05, 0.1, F.x);
	float n = facets;// * dots;
	color = vec4(n, n, n, 1.0);
}*/