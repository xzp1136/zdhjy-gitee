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
    vs_COLOR0 = in_COLOR0;
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
uniform 	mediump vec4 _Color;
uniform 	mediump vec4 _WaterColor;
uniform 	mediump vec4 _HighlightColor;
uniform 	vec4 _FlowTiling;
uniform 	vec4 _DetailTiling;
uniform 	vec4 _FlowSpeed;
uniform 	vec4 _DetailSpeed;
uniform 	float _FlowTimeScale;
uniform 	float _BaseDistortion;
uniform 	float _DetailStrength;
uniform 	float _Perspective;
uniform 	float _EdgeProtectWidth;
uniform 	float _WaterFloatStrength;
uniform 	float _WaterFloatSpeed;
uniform 	float _WaterFloatScale;
uniform 	float _EdgeFloatStrength;
uniform 	float _EdgeAlphaFloat;
uniform 	float _HighlightThreshold;
uniform 	float _HighlightSoftness;
uniform 	float _HighlightStrength;
uniform 	float _WaterAlpha;
UNITY_LOCATION(0) uniform mediump sampler2D _FlowTex;
UNITY_LOCATION(1) uniform mediump sampler2D _DetailTex;
UNITY_LOCATION(2) uniform mediump sampler2D _MainTex;
in highp vec2 vs_TEXCOORD0;
in mediump vec4 vs_COLOR0;
layout(location = 0) out mediump vec4 SV_Target0;
vec3 u_xlat0;
vec4 u_xlat1;
vec4 u_xlat2;
mediump vec3 u_xlat16_3;
mediump vec3 u_xlat16_4;
vec2 u_xlat5;
mediump float u_xlat16_8;
vec2 u_xlat10;
vec2 u_xlat11;
float u_xlat15;
float u_xlat16;
void main()
{
    u_xlat0.xy = (-vs_TEXCOORD0.xy) + vec2(1.0, 1.0);
    u_xlat0.xy = min(u_xlat0.xy, vs_TEXCOORD0.xy);
    u_xlat0.x = min(u_xlat0.y, u_xlat0.x);
    u_xlat5.x = max(_EdgeProtectWidth, 0.00100000005);
    u_xlat5.x = float(1.0) / u_xlat5.x;
    u_xlat0.x = u_xlat5.x * u_xlat0.x;
    u_xlat0.x = clamp(u_xlat0.x, 0.0, 1.0);
    u_xlat5.x = u_xlat0.x * -2.0 + 3.0;
    u_xlat0.x = u_xlat0.x * u_xlat0.x;
    u_xlat0.x = u_xlat0.x * u_xlat5.x;
    u_xlat0.x = u_xlat0.x * 0.220000029 + 0.779999971;
    u_xlat5.xy = vs_TEXCOORD0.xy * _FlowTiling.xy;
    u_xlat15 = _Time.y * _FlowTimeScale;
    u_xlat1.xy = vec2(u_xlat15) * _FlowSpeed.xy;
    u_xlat11.xy = vec2(u_xlat15) * _DetailSpeed.xy;
    u_xlat2.y = vs_TEXCOORD0.y * _Perspective + 1.0;
    u_xlat2.x = 1.0;
    u_xlat5.xy = u_xlat5.xy * u_xlat2.xy + u_xlat1.xy;
    u_xlat5.xy = texture(_FlowTex, u_xlat5.xy).xy;
    u_xlat5.xy = u_xlat5.xy * vec2(2.0, 2.0) + vec2(-1.0, -1.0);
    u_xlat1.xy = vs_TEXCOORD0.xy * _DetailTiling.xy;
    u_xlat1.xy = u_xlat1.xy * u_xlat2.xy + u_xlat11.xy;
    u_xlat1.xy = texture(_DetailTex, u_xlat1.xy).xy;
    u_xlat1.xy = u_xlat1.xy * vec2(2.0, 2.0) + vec2(-1.0, -1.0);
    u_xlat10.xy = u_xlat1.xy * vec2(vec2(_DetailStrength, _DetailStrength)) + u_xlat5.xy;
    u_xlat5.x = u_xlat5.x + (-u_xlat1.y);
    u_xlat5.x = abs(u_xlat5.x) * 0.340000004;
    u_xlat1.xy = u_xlat10.xy * vec2(vec2(_BaseDistortion, _BaseDistortion));
    u_xlat1.xy = u_xlat0.xx * u_xlat1.xy;
    u_xlat11.xy = u_xlat1.xy * vec2(0.479999989, 0.479999989);
    u_xlat0.x = vs_TEXCOORD0.y * -0.160000026 + 1.0;
    u_xlat1.xy = u_xlat1.xy * u_xlat0.xx + u_xlat11.xy;
    u_xlat0.x = dot(vs_TEXCOORD0.xy, vec2(0.629999995, 0.370000005));
    u_xlat0.x = u_xlat0.x * _WaterFloatScale;
    u_xlat11.x = _Time.y * _WaterFloatSpeed;
    u_xlat2.xyz = u_xlat11.xxx * vec3(6.28318548, 3.64424753, 4.52389383);
    u_xlat0.x = u_xlat0.x * 4.52389383 + (-u_xlat2.y);
    u_xlat0.x = u_xlat10.x * 1.10000002 + u_xlat0.x;
    u_xlat0.x = sin(u_xlat0.x);
    u_xlat0.x = u_xlat0.x * 0.319999993;
    u_xlat11.xy = vs_TEXCOORD0.xy * vec2(vec2(_WaterFloatScale, _WaterFloatScale));
    u_xlat11.x = u_xlat11.x * 6.28318548 + u_xlat2.x;
    u_xlat16 = u_xlat11.y * 5.15221214 + (-u_xlat2.z);
    u_xlat16 = u_xlat10.x * 1.20000005 + u_xlat16;
    u_xlat16 = sin(u_xlat16);
    u_xlat16 = u_xlat16 * _WaterFloatStrength;
    u_xlat2.x = u_xlat16 * 0.280000001;
    u_xlat11.x = u_xlat10.y * 1.35000002 + u_xlat11.x;
    u_xlat10.x = dot(u_xlat10.xy, u_xlat10.xy);
    u_xlat10.x = sqrt(u_xlat10.x);
    u_xlat5.x = u_xlat10.x * 0.460000008 + u_xlat5.x;
    u_xlat5.x = min(u_xlat5.x, 1.0);
    u_xlat5.x = u_xlat5.x + (-_HighlightThreshold);
    u_xlat10.x = sin(u_xlat11.x);
    u_xlat0.x = u_xlat10.x * 0.680000007 + u_xlat0.x;
    u_xlat2.y = u_xlat0.x * _WaterFloatStrength;
    u_xlat0.xz = u_xlat1.xy + u_xlat2.xy;
    u_xlat1.xy = u_xlat2.xy * vec2(_EdgeFloatStrength);
    u_xlat1.xy = u_xlat1.xy * vec2(0.699999988, 0.699999988) + vs_TEXCOORD0.xy;
    u_xlat1.xy = clamp(u_xlat1.xy, 0.0, 1.0);
    u_xlat15 = texture(_MainTex, u_xlat1.xy).w;
    u_xlat0.xz = u_xlat0.xz + vs_TEXCOORD0.xy;
    u_xlat0.xz = clamp(u_xlat0.xz, 0.0, 1.0);
    u_xlat1 = texture(_MainTex, u_xlat0.xz);
    u_xlat16_3.x = u_xlat1.w + -0.0199999996;
    u_xlat16_3.x = u_xlat16_3.x * 5.55555534;
    u_xlat16_3.x = clamp(u_xlat16_3.x, 0.0, 1.0);
    u_xlat16_8 = u_xlat16_3.x * -2.0 + 3.0;
    u_xlat16_3.x = u_xlat16_3.x * u_xlat16_3.x;
    u_xlat16_3.x = u_xlat16_3.x * u_xlat16_8;
    u_xlat2 = texture(_MainTex, vs_TEXCOORD0.xy);
    u_xlat1.xyz = u_xlat1.xyz + (-u_xlat2.xyz);
    u_xlat1.xyz = u_xlat16_3.xxx * u_xlat1.xyz + u_xlat2.xyz;
    u_xlat16_3.xyz = u_xlat1.xyz * _WaterColor.xyz;
    u_xlat16_4.xyz = u_xlat16_3.xyz * vs_COLOR0.xyz;
    u_xlat1.xyz = (-u_xlat16_3.xyz) * vs_COLOR0.xyz + _HighlightColor.xyz;
    u_xlat0.x = float(1.0) / _HighlightSoftness;
    u_xlat0.x = u_xlat0.x * u_xlat5.x;
    u_xlat0.x = clamp(u_xlat0.x, 0.0, 1.0);
    u_xlat5.x = u_xlat0.x * -2.0 + 3.0;
    u_xlat0.x = u_xlat0.x * u_xlat0.x;
    u_xlat0.x = u_xlat0.x * u_xlat5.x;
    u_xlat0.x = u_xlat0.x * _HighlightStrength;
    u_xlat0.x = clamp(u_xlat0.x, 0.0, 1.0);
    u_xlat1.xyz = u_xlat0.xxx * u_xlat1.xyz + u_xlat16_4.xyz;
    u_xlat0.x = u_xlat15 + (-u_xlat2.w);
    u_xlat0.x = _EdgeAlphaFloat * u_xlat0.x + u_xlat2.w;
    u_xlat0.x = u_xlat0.x * vs_COLOR0.w;
    u_xlat0.x = u_xlat0.x * _Color.w;
    u_xlat1.w = u_xlat0.x * _WaterAlpha;
    SV_Target0 = u_xlat1;
    return;
}

#endif
