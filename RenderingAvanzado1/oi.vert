#version 430

layout (location = 0) in vec3 inPosition;
layout (location = 1) in vec3 inNormal;

out vec3 outPosition;
out vec3 outNormal;

uniform mat4 modelView;
uniform mat3 normalMatrix;
uniform mat4 modelViewProj;

void main()
{
    outNormal = normalize( normalMatrix * inNormal);
    outPosition = vec3( modelView * vec4(inPosition,1.0) );

    gl_Position = modelViewProj * vec4(inPosition,1.0);
}
