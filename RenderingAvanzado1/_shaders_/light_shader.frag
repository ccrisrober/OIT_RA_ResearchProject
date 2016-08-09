#version 430 core

uniform sampler2D positionTexture;
uniform sampler2D normalTexture;
uniform sampler2D colorTexture;

uniform vec2 screenSize;

out vec4 fragColor;

void main() {
	vec2 coord = gl_FragCoord.xy / screenSize;

	fragColor = vec4(texture(colorTexture, coord).xyz, 1.0);
}