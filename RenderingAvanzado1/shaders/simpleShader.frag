#version 330 core
in vec3 Pos;
in vec3 Norm;
in vec2 TexCoord;


out vec4 ocolor;
uniform vec4 color;

vec3 lightColor = vec3(0.8, 0.7, 0.3);
vec3 lightPos = vec3(0, -0.55, 0);

void main() {
    // Ambient
    float ambientStrength = 0.001f;
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse 
    vec3 norm = normalize(Norm);
    vec3 lightDir = normalize(lightPos - Pos);
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    vec3 result = (ambient + diffuse) * color;
    ocolor = vec4(result, 1.0f);
}