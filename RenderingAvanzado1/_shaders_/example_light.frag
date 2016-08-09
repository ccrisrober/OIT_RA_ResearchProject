#version 330 core
in vec3 Pos;
in vec3 Norm;
/*in vec2 TexCoord;*/

out vec4 ocolor;
uniform vec4 color;

vec3 lightColor = vec3(0.8, 0.7, 0.3);
vec3 lightPos = vec3(1.2, 1.0, 2.0);

void main() {
    ocolor = color;
}