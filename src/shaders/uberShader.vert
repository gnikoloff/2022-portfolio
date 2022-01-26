#version 300 es

-- DEFINES_HOOK --

uniform Camera {
  mat4 viewMatrix;
  mat4 projectionViewMatrix;
};

uniform mat4 u_worldMatrix;

#ifdef USE_TEXTURE
  uniform sampler2D diffuse;
#endif

#ifdef USE_SPIRAL_DEFORM
  uniform float u_deformAngle;
#endif

in vec4 aPosition;
in vec2 aUv;

#ifdef USE_SHADING
  in vec4 aNormal;
  out vec4 vNormal;
#endif

#ifdef USE_INSTANCING
  in mat4 aInstanceMatrix;
#endif

#ifdef IS_FOG
  out float vFogDepth;
#endif

out vec2 vUv;

#include utils/do-box-twist;

void main () {
  mat4 worldMatrix = mat4(1.0);
  
  #ifdef USE_INSTANCING
    worldMatrix = aInstanceMatrix;
  #endif

  worldMatrix *= u_worldMatrix;
  
  vec4 position = aPosition;

  #ifdef USE_SPIRAL_DEFORM
    float ang = (position.x + 0.5) * sin(u_deformAngle) * u_deformAngle;
    position = doBoxTwist(position, ang);
  #endif

  gl_Position = projectionViewMatrix * worldMatrix * position;
  
  vUv = aUv;

  #ifdef USE_SHADING
    vec4 normal = aNormal;
    #ifdef USE_SPIRAL_DEFORM
      normal = doBoxTwist(normal, ang);
    #endif
    vNormal = normal;
  #endif

  #ifdef IS_FOG
    mat4 worldView = viewMatrix * worldMatrix;
    vFogDepth = -(worldView * aPosition).z;
  #endif

}
