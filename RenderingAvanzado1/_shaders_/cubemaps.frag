#version 330 core
//layout(early_fragment_tests) in;
in vec2 TexCoord;

out vec4 color;

uniform sampler2D ourTexture1;

void main() {
    color = vec4(vec3(texture(ourTexture1, TexCoord)), 1.0);//mix(texture(ourTexture1, TexCoord), texture(ourTexture2, TexCoord), 0.2);
}