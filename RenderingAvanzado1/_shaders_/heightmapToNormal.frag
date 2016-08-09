#version 440
out vec4 color;
uniform sampler2D unit_wave;
in vec2 TexCoords;
const vec2 size = vec2(2.0,0.0);
const ivec3 off = ivec3(-1,0,1);
void main()
{    
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
}