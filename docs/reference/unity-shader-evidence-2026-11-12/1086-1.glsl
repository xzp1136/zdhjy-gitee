#ifdef VERTEX
#version 300 es

#define HLSLCC_ENABLE_UNIFORM_BUFFERS 1
#if HLSLCC_ENABLE_UNIFORM_BUFFERS
#define UNITY_UNIFORM
#else
#define UNITY_UNIFORM uniform
#endif
#define UNITY_SUPPORTS_UNIFORM_LOCATION 1
#if UNITY_SUPPORTS_UNIFORM_LOCATION
#define UNITY_LOCATION(x) layout(location = x)
#define UNITY_BINDING(x) layout(binding = x, std140)
#else
#define UNITY_LOCATION(x)
#define UNITY_BINDING(x) layout(std140)
#endif
uniform 	vec4 hlslcc_mtx4x4unity_ObjectToWorld[4];
uniform 	vec4 hlslcc_mtx4x4unity_MatrixVP[4];
uniform 	mediump vec4 _Color;
in highp vec4 in_POSITION0;
in highp vec2 in_TEXCOORD0;
in mediump vec4 in_COLOR0;
out highp vec2 vs_TEXCOORD0;
out mediump vec4 vs_COLOR0;
vec4 u_xlat0;
vec4 u_xlat1;
void main()
{
    u_xlat0 = in_POSITION0.yyyy * hlslcc_mtx4x4unity_ObjectToWorld[1];
    u_xlat0 = hlslcc_mtx4x4unity_ObjectToWorld[0] * in_POSITION0.xxxx + u_xlat0;
    u_xlat0 = hlslcc_mtx4x4unity_ObjectToWorld[2] * in_POSITION0.zzzz + u_xlat0;
    u_xlat0 = u_xlat0 + hlslcc_mtx4x4unity_ObjectToWorld[3];
    u_xlat1 = u_xlat0.yyyy * hlslcc_mtx4x4unity_MatrixVP[1];
    u_xlat1 = hlslcc_mtx4x4unity_MatrixVP[0] * u_xlat0.xxxx + u_xlat1;
    u_xlat1 = hlslcc_mtx4x4unity_MatrixVP[2] * u_xlat0.zzzz + u_xlat1;
    gl_Position = hlslcc_mtx4x4unity_MatrixVP[3] * u_xlat0.wwww + u_xlat1;
    vs_TEXCOORD0.xy = in_TEXCOORD0.xy;
    vs_COLOR0 = in_COLOR0 * _Color;
    return;
}

#endif
#ifdef FRAGMENT
#version 300 es

precision highp float;
precision highp int;
#define HLSLCC_ENABLE_UNIFORM_BUFFERS 1
#if HLSLCC_ENABLE_UNIFORM_BUFFERS
#define UNITY_UNIFORM
#else
#define UNITY_UNIFORM uniform
#endif
#define UNITY_SUPPORTS_UNIFORM_LOCATION 1
#if UNITY_SUPPORTS_UNIFORM_LOCATION
#define UNITY_LOCATION(x) layout(location = x)
#define UNITY_BINDING(x) layout(binding = x, std140)
#else
#define UNITY_LOCATION(x)
#define UNITY_BINDING(x) layout(std140)
#endif
uniform 	vec4 _Time;
uniform 	vec4 _SpriteUVRect;
uniform 	float _WaterCut;
uniform 	float _ShowUnderWater;
uniform 	float _CutSoftness;
uniform 	float _CutTilt;
uniform 	float _CurveStrength;
uniform 	float _CurveCenter;
uniform 	float _CurveWidth;
uniform 	float _CurvePower;
uniform 	float _WaveStrength;
uniform 	float _WaveSpeed;
uniform 	float _WaveDensity;
UNITY_LOCATION(0) uniform mediump sampler2D _MainTex;
in highp vec2 vs_TEXCOORD0;
in mediump vec4 vs_COLOR0;
layout(location = 0) out mediump vec4 SV_Target0;
vec3 u_xlat0;
vec4 u_xlat1;
vec2 u_xlat2;
float u_xlat4;
bool u_xlatb4;
float u_xlat6;
void main()
{
    u_xlat0.x = _CurveWidth * 0.5;
    u_xlat0.yz = (-_SpriteUVRect.xy) + _SpriteUVRect.zw;
    u_xlat0.xyz = max(u_xlat0.xyz, vec3(9.99999975e-05, 9.99999975e-05, 9.99999975e-05));
    u_xlat1.xy = vs_TEXCOORD0.xy + (-_SpriteUVRect.xy);
    u_xlat2.xy = u_xlat1.xy / u_xlat0.yz;
    u_xlat2.xy = clamp(u_xlat2.xy, 0.0, 1.0);
    u_xlat6 = u_xlat2.x + (-_CurveCenter);
    u_xlat0.x = u_xlat6 / u_xlat0.x;
    u_xlat0.x = (-u_xlat0.x) * u_xlat0.x + 1.0;
    u_xlat0.x = max(u_xlat0.x, 0.0);
    u_xlat0.x = log2(u_xlat0.x);
    u_xlat6 = max(_CurvePower, 9.99999975e-05);
    u_xlat0.x = u_xlat0.x * u_xlat6;
    u_xlat0.x = exp2(u_xlat0.x);
    u_xlat0.x = u_xlat0.x * _CurveStrength + _WaterCut;
    u_xlat6 = u_xlat2.x + -0.5;
    u_xlat0.x = u_xlat6 * _CutTilt + u_xlat0.x;
    u_xlat6 = _Time.y * _WaveSpeed;
    u_xlat2.x = u_xlat2.x * _WaveDensity + u_xlat6;
    u_xlat2.x = u_xlat2.x * 6.28318548;
    u_xlat2.x = sin(u_xlat2.x);
    u_xlat0.x = u_xlat2.x * _WaveStrength + u_xlat0.x;
    u_xlat0.x = clamp(u_xlat0.x, 0.0, 1.0);
    u_xlat2.x = u_xlat0.x + _CutSoftness;
    u_xlat0.x = u_xlat0.x + (-_CutSoftness);
    u_xlat2.x = (-u_xlat0.x) + u_xlat2.x;
    u_xlat0.x = (-u_xlat0.x) + u_xlat2.y;
    u_xlat2.x = float(1.0) / u_xlat2.x;
    u_xlat0.x = u_xlat2.x * u_xlat0.x;
    u_xlat0.x = clamp(u_xlat0.x, 0.0, 1.0);
    u_xlat2.x = u_xlat0.x * -2.0 + 3.0;
    u_xlat0.x = u_xlat0.x * u_xlat0.x;
    u_xlat0.x = u_xlat0.x * u_xlat2.x;
    u_xlat2.x = u_xlat0.x * -2.0 + 1.0;
    u_xlatb4 = _ShowUnderWater>=0.5;
    u_xlat4 = u_xlatb4 ? 1.0 : float(0.0);
    u_xlat0.x = u_xlat4 * u_xlat2.x + u_xlat0.x;
    u_xlat1 = texture(_MainTex, vs_TEXCOORD0.xy);
    u_xlat1 = u_xlat1 * vs_COLOR0;
    u_xlat1.w = u_xlat0.x * u_xlat1.w;
    SV_Target0 = u_xlat1;
    return;
}

#endif
