import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uTrailLength;
uniform vec3 uWaxColor;
uniform vec3 uPaperColor;

vec4 permute(vec4 x) {
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P) {
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000), dot(g010,g010), dot(g100,g100), dot(g110,g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001), dot(g011,g011), dot(g101,g101), dot(g111,g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

float paperTexture(vec2 uv, float time) {
  float scale = 12.0;
  float noise1 = cnoise(vec3(uv * scale, time * 0.05));
  float noise2 = cnoise(vec3(uv * scale * 2.0, time * 0.1 + 10.0));
  float combined = noise1 * 0.6 + noise2 * 0.4;
  float texture = 0.5 + 0.5 * combined;
  float grain = cnoise(vec3(uv * 200.0, time * 0.2)) * 0.03;
  return texture + grain;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 mouseUV = uMouse / uResolution;
  float dist = distance(uv, mouseUV);
  float smoothFactor = smoothstep(0.0, uTrailLength, dist);
  smoothFactor = 1.0 - smoothFactor;
  float angle = atan(uv.y - mouseUV.y, uv.x - mouseUV.x);
  float trailInfluence = smoothFactor * (0.5 + 0.5 * sin(angle * 5.0 + uTime * 2.0)) * (0.5 + 0.5 * sin(dist * 20.0 - uTime * 3.0));
  float paper = paperTexture(uv, uTime);
  vec3 finalColor = mix(uPaperColor, uWaxColor, trailInfluence);
  finalColor *= paper;
  finalColor *= 1.0 - smoothstep(0.3, 1.0, length(uv - 0.5) * 0.5);
  gl_FragColor = vec4(finalColor, 1.0);
}
`

function WaxPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetMouse = useRef({ x: 0, y: 0 })
  const smoothMouse = useRef({ x: 0, y: 0 })

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uTrailLength: { value: 0.15 },
      uWaxColor: { value: new THREE.Color(0.48, 0.43, 0.87) },
      uPaperColor: { value: new THREE.Color(0.05, 0.05, 0.06) },
    }),
    []
  )

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const el = document.getElementById('hero-section')
      if (!el) return
      const rect = el.getBoundingClientRect()
      targetMouse.current.x = e.clientX - rect.left
      targetMouse.current.y = rect.height - (e.clientY - rect.top)
    }

    const el = document.getElementById('hero-section')
    if (el) {
      el.addEventListener('pointermove', handleMove)
    }

    const handleResize = () => {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (el) el.removeEventListener('pointermove', handleMove)
      window.removeEventListener('resize', handleResize)
    }
  }, [uniforms])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const material = meshRef.current.material as THREE.ShaderMaterial
    material.uniforms.uTime.value += delta
    smoothMouse.current.x += (targetMouse.current.x - smoothMouse.current.x) * 0.05
    smoothMouse.current.y += (targetMouse.current.y - smoothMouse.current.y) * 0.05
    material.uniforms.uMouse.value.x = smoothMouse.current.x
    material.uniforms.uMouse.value.y = smoothMouse.current.y
  })

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function WaxCanvas() {
  return (
    <Canvas
      orthographic
      camera={{ zoom: 1, position: [0, 0, 1] }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      dpr={Math.min(window.devicePixelRatio, 1.5)}
    >
      <WaxPlane />
    </Canvas>
  )
}
