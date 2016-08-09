#version 440

in vec4 ProjTexCoord;

layout(binding = 0) uniform sampler2D ProjectorTex;

out vec4 color;

void main() {
	vec4 projTexColor = vec4(0.0);
	if(ProjTexCoord.z > 0.0) {
		projTexColor = textureProj(ProjectorTex, ProjTexCoord);
	}

    color = vec4(0.0, 0.0, 0.8, 0.4) + projTexColor;
}