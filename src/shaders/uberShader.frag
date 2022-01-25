#version 300 es
precision highp float;

-- DEFINES_HOOK --

#ifdef USE_TEXTURE
  uniform sampler2D u_diffuse;
#endif

#ifdef USE_SOLID_COLOR
  uniform vec4 u_solidColor;
#endif

#ifdef USE_UV_TRANSFORM
  uniform vec4 u_uvOffsetSizes;
#endif

#ifdef USE_BACKGROUND_SIZE_COVER
  // webgl2 supports textureSize(), but passing it since we are using a texture atlas
  uniform vec2 u_textureSize;
#endif

#ifdef SUPPORTS_FADING
  uniform float u_fadeMixFactor;
#endif

#ifdef USE_GAUSSIAN_BLUR
  uniform vec2 u_resolution;
  uniform vec2 u_blurDirection;
#endif

#ifdef USE_MASK_TEXTURE
  uniform sampler2D u_maskTexture;
  uniform vec4 u_uvOffsetSizesMask;
  uniform float u_revealMixFactor;
#endif

#ifdef SUPPORTS_HOVER_MASK_FX
  uniform float u_hoverMixFactor;
#endif

in vec4 vNormal;
in vec2 vUv;

out vec4 finalColor;

const float FACE_COUNT = 6.0;
const float FACE_STEP = 1.0 / FACE_COUNT;
const float FACE_STEP2 = FACE_STEP * 2.0;

#include utils/map-vec2-range;
#include utils/uv-background-cover;
#include utils/blur-9-taps;
#include utils/blur-13-taps;
#include utils/linearize-depth;

vec4 blendNormal(vec4 base, vec4 blend, float opacity) {
	return (blend * opacity + base * (1.0 - opacity));
}
 
void main () {
  vec2 borderUV = vUv;
  vec2 uv = vUv;
  vec2 maskUV = vUv;

  #ifdef IS_CUBE
    if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) {
      uv = mapVec2Range(uv, vec2(FACE_STEP), vec2(FACE_STEP2), vec2(0.0), vec2(1.0));
      borderUV = uv;
    }
  #endif

  #ifdef USE_BACKGROUND_SIZE_COVER
    uv = uvTransformBackgroundCover(uv, u_textureSize, vec2(MESH_WIDTH, MESH_HEIGHT));
  #endif

  #ifdef USE_UV_TRANSFORM
    uv = mix(
      u_uvOffsetSizes.xy,
      u_uvOffsetSizes.zw,
      uv
    );
    #ifdef USE_MASK_TEXTURE
      maskUV = uvTransformBackgroundCover(vUv, vec2(128.0), vec2(MESH_WIDTH, MESH_HEIGHT));
      maskUV = mix(
        u_uvOffsetSizesMask.xy,
        u_uvOffsetSizesMask.zw,
        maskUV
      );
    #endif
  #endif

  #ifdef USE_SOLID_COLOR
    finalColor = u_solidColor;
  #else
    #ifdef USE_TEXTURE
      // https://bgolus.medium.com/sharper-mipmapping-using-shader-based-supersampling-ed7aadb47bec
      float lodBias = -0.5;
      #ifdef IS_CUBE
        if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) { 
          float aspect = MESH_WIDTH / MESH_HEIGHT;
          float borderWidth = 0.02;
          float maxX = 1.0 - borderWidth;
          float minX = borderWidth;
          float maxY = 1.0 - borderWidth;
          float minY = borderWidth;
          if (
            borderUV.x < maxX &&
            borderUV.x > minX &&
            borderUV.y < maxY &&
            borderUV.y > minY
          ) {
            finalColor = texture(u_diffuse, uv, -0.5);  
          } else {
            finalColor = vec4(vec3(0.3), 1.0);
          }
        } else {
          finalColor = vec4(vec3(0.3), 1.0);
        }
      #else
        #ifdef USE_GAUSSIAN_BLUR
          finalColor = blur9(u_diffuse, uv, u_resolution, u_blurDirection);
        #else
          #ifdef USE_MASK_TEXTURE
            vec4 maskColor = texture(u_maskTexture, maskUV);
            vec4 texColor = texture(u_diffuse, uv);
            finalColor = mix(vec4(0.0), texColor, 1.0 - step(u_revealMixFactor, maskColor.r));
            #ifdef SUPPORTS_HOVER_MASK_FX
              vec4 hoverColor = vec4(vec3(1.0) - texColor.rgb, texColor.a);
              hoverColor = mix(vec4(0.0), hoverColor, 1.0 - step(u_hoverMixFactor, maskColor.r));
              // hoverColor = hoverColor;
              finalColor.rgb = blendNormal(finalColor, hoverColor, u_hoverMixFactor).rgb;
            #endif
          #else
            finalColor = texture(u_diffuse, uv, -0.5);
          #endif
        #endif
      #endif
    #else
      finalColor = vec4(uv, 0.0, 1.0);
    #endif
  #endif

  #ifdef SUPPORTS_FADING
    finalColor.rgb = mix(vec3(0.1), finalColor.rgb, u_fadeMixFactor);
  #endif
}
