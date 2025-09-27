'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CloudEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 1;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Create noise texture
    const createNoiseTexture = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.createImageData(size, size);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random();
        imageData.data[i] = noise * 255;     // R
        imageData.data[i + 1] = noise * 255; // G
        imageData.data[i + 2] = noise * 255; // B
        imageData.data[i + 3] = 255;         // A
      }
      
      ctx.putImageData(imageData, 0, 0);
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      return texture;
    };

    // Shaders
    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `;

    const fragmentShader = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform sampler2D u_noise;

      vec3 hash33(vec3 p){ 
        return texture2D(u_noise, p.xy * p.z * 256.).rgb;
      }

      mat2 rot2( float a ){ 
        vec2 v = sin(vec2(1.570796, 0) + a);
        return mat2(v, -v.y, v.x); 
      }
      
      float pn( in vec3 p ) {
        vec3 i = floor(p); 
        p -= i; 
        p *= p*(3. - 2.*p);
        p.xy = texture2D(u_noise, (p.xy + i.xy + vec2(37, 17)*i.z + .5)/256., -100.).yx;
        return mix(p.x, p.y, p.z);
      }
      
      float trigNoise3D(in vec3 p) {
        float res = 0., sum = 0.;
        float n = pn(p*8. + u_time*.1);
        
        vec3 t = sin(p*3.14159265 + cos(p*3.14159265+1.57/2.))*0.5 + 0.5;
        p = p*1.5 + (t - 1.5);
        res += (dot(t, vec3(0.333)));

        t = sin(p.yzx*3.14159265 + cos(p.zxy*3.14159265+1.57/2.))*0.5 + 0.5;
        res += (dot(t, vec3(0.333)))*0.7071;    

        return ((res/1.7071))*0.85 + n*0.15;
      }

      float world(vec3 p) {
        float n = trigNoise3D(p * .1) * 10.;
        p.y += n;
        return p.y - 3.;
      }
      
      vec3 path(float p) {
        return vec3(sin(p*.05)*10., cos(p * .3), p);
      }

      void main() {
        vec2 aspect = vec2(u_resolution.x/u_resolution.y, 1.0);
        vec2 uv = (2.0*gl_FragCoord.xy/u_resolution.xy - 1.0)*aspect;
        
        float modtime = u_time * 2.;
        vec3 movement = path(modtime);
        
        vec3 lookAt = vec3(0, -.2, 0) + path(modtime + 1.);
        vec3 camera_position = vec3(0,0,-1) + movement;
        
        vec3 forward = normalize(lookAt-camera_position);
        vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
        vec3 up = normalize(cross(forward,right));

        float FOV = .8;
        vec3 ro = camera_position; 
        vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
        rd.xy = rot2( movement.x * .04 )*rd.xy;

        vec3 lp = vec3( 0, -10, 10.5);
        lp += ro;

        float local_density = 0.;
        float density = 0.;
        float weighting = 0.;

        float dist = 1.;
        float travelled = 0.;

        const float distanceThreshold = .3;

        vec3 col = vec3(0);
        vec3 sp;
        vec3 sn = normalize(-rd);

        for (int i=0; i<64; i++) {
          if((density>1.) || travelled>80.) {
            travelled = 80.;
            break;
          }

          sp = ro + rd*travelled;
          dist = world(sp);
          
          if(dist < .3) dist = .25;

          local_density = (distanceThreshold - dist)*step(dist, distanceThreshold);
          weighting = (1. - density)*local_density;

          density += weighting*(1.-distanceThreshold)*1./dist*.1;

          vec3 ld = lp-sp;
          float lDist = max(length(ld), .001);
          ld/=lDist;

          float atten = 1./(1. + lDist*.125 + lDist*lDist*.55);

          col += weighting*atten*1.25 ;

          travelled += max(dist*.2, .02);
        }
        
        vec3 sunDir = normalize(lp-ro);
        float sunF = 1. - dot(rd,sunDir);

        col = mix(
          mix(
            vec3(.5),
            vec3(1),
            col * density * 5.), vec3(0.), col);
        col = mix(col, vec3(4.), (5.-density)*.01*(1.+sunF*.5));
        col = mix(
          col, 
          mix(
            vec3(0.4, 0.3, .2)*3.,
            vec3(0.5, 0.8, 1.0)*.9,
            sunF*sunF*1.
          ),
          travelled*.01);
        
        col *= col*col*col*2.;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // Create geometry and material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_mouse: { value: new THREE.Vector2(0, 0) },
        u_time: { value: 0 },
        u_noise: { value: createNoiseTexture() }
      }
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse interaction
    const handleMouseMove = (event: MouseEvent) => {
      material.uniforms.u_mouse.value.x = event.clientX;
      material.uniforms.u_mouse.value.y = window.innerHeight - event.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (material.uniforms.u_time) {
        material.uniforms.u_time.value = performance.now() * 0.001;
      }
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!renderer || !camera || !material.uniforms.u_resolution) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
      material.uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
