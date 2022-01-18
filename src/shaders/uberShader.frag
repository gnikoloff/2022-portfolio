#version 300 es
precision highp float;

-- DEFINES_HOOK --

#ifdef USE_TEXTURE
  uniform sampler2D u_diffuse;
#endif

#ifdef USE_SOLID_COLOR
  uniform vec4 solidColor;
#endif

#ifdef USE_UV_TRANSFORM
  uniform vec4 u_uvOffsetSizes;
  // webgl2 supports textureSize(), but passing it since we are using a mega texture
  uniform vec2 u_textureSize;
#endif

#ifdef SUPPORTS_FADING
  uniform float u_fadeMixFactor;
#endif

in vec4 vNormal;
in vec2 vUv;

out vec4 finalColor;

const float FACE_COUNT = 6.0;
const float FACE_STEP = 1.0 / FACE_COUNT;
const float FACE_STEP2 = FACE_STEP * 2.0;

vec2 mapVec2Range(vec2 value, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

vec2 uvTransformBackgroundCover (vec2 uv, vec2 imageSize, vec2 displaySize) {
  float rs = displaySize.x / displaySize.y;
  float ri = imageSize.x / imageSize.y;
  vec2 new = rs < ri ? vec2(imageSize.x * displaySize.y / imageSize.y, displaySize.y) : vec2(displaySize.x, imageSize.y * displaySize.x / imageSize.x);
  vec2 offset = (rs < ri ? vec2((new.x - displaySize.x) / 2.0, 0.0) : vec2(0.0, (new.y - displaySize.y) / 2.0)) / new;
  return uv * displaySize / new + offset;
}

 
void main () {
  vec2 uvNoOffset = vUv;
  vec2 uv = vUv;

  #ifdef IS_CUBE
    float faceStep = 1.0 / FACE_COUNT;
    if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) {
      uv = mapVec2Range(vUv, vec2(FACE_STEP), vec2(FACE_STEP2), vec2(0.0), vec2(1.0));
      uvNoOffset = uv;
    }
  #endif

  #ifdef USE_BACKGROUND_SIZE_COVER
    uv = uvTransformBackgroundCover(uv, u_textureSize, vec2(MESH_WIDTH, MESH_HEIGHT));
    // uvNoOffset = uv;
  #endif

  #ifdef USE_UV_TRANSFORM
    uv = mix(
      u_uvOffsetSizes.xy,
      u_uvOffsetSizes.zw,
      uv
    );
  #endif

  #ifdef USE_SOLID_COLOR
    finalColor = solidColor;
  #else
    #ifdef USE_TEXTURE
      // https://bgolus.medium.com/sharper-mipmapping-using-shader-based-supersampling-ed7aadb47bec
      float lodBias = -0.5;
      #ifdef IS_CUBE
        if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) { 
          float aspect = MESH_WIDTH / MESH_HEIGHT;
          float border_width = 0.015;
          float maxX = 1.0 - border_width;
          float minX = border_width;
          float maxY = 1.0 - border_width;
          float minY = border_width;
          if (
            uvNoOffset.x < maxX &&
            uvNoOffset.x > minX &&
            uvNoOffset.y < maxY &&
            uvNoOffset.y > minY
          ) {
            finalColor = texture(u_diffuse, uv, -0.5);  
          } else {
            finalColor = vec4(0.0, 1.0, 0.0, 1.0);
          }
        } else {
          finalColor = vec4(uv, 0.0, 1.0);
        }
      #else
        finalColor = texture(u_diffuse, uv, -0.5);
      #endif
    #else
      finalColor = vec4(uv, 0.0, 1.0);
    #endif
  #endif

  #ifdef SUPPORTS_FADING
    finalColor.rgb = mix(vec3(0.1), finalColor.rgb, u_fadeMixFactor);
  #endif
}
