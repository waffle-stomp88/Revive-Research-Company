import { useEffect, useRef } from 'react';

interface MistBackgroundProps {
  className?: string;
}

const MistBackground: React.FC<MistBackgroundProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) {
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
      }

      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for (int i = 0; i < 6; i++) {
              v += a * noise(p);
              p *= 2.0;
              a *= 0.5;
          }
          return v;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;

          vec2 mPos = u_mouse / u_resolution.xy;
          mPos.x *= u_resolution.x / u_resolution.y;
          float dist = distance(uv, mPos);

          vec2 q = vec2(0.0);
          q.x = fbm(uv + 0.05 * u_time);
          q.y = fbm(uv + vec2(1.0, 1.0));

          vec2 r = vec2(0.0);
          r.x = fbm(uv + 1.0 * q + vec2(1.7, 9.2) + 0.12 * u_time);
          r.y = fbm(uv + 1.0 * q + vec2(8.3, 2.8) + 0.10 * u_time);

          float f = fbm(uv + r);

          // Revive Research color palette - dark charcoal base with cyan/gold hints
          vec3 baseColor = vec3(0.102, 0.102, 0.122); // #1a1a1f - dark charcoal
          vec3 mistColor = vec3(0.15, 0.18, 0.22); // slightly lighter mist
          vec3 accentColor1 = vec3(0.13, 0.85, 1.0); // #21d8ff - cyan accent
          vec3 accentColor2 = vec3(0.906, 0.984, 0.063); // #E7FB10 - gold/yellow accent

          vec3 color = mix(baseColor, mistColor, f * 0.8);
          
          // Add subtle cyan glow in upper regions
          float cyanInfluence = smoothstep(0.4, 0.8, uv.y) * 0.08;
          color = mix(color, accentColor1, cyanInfluence * f);
          
          // Add very subtle gold in lower regions
          float goldInfluence = smoothstep(0.6, 0.2, uv.y) * 0.04;
          color = mix(color, accentColor2, goldInfluence * dot(q, r) * 0.3);

          // Subtle mouse glow with cyan tint
          float mouseGlow = smoothstep(0.4, 0.0, dist);
          color += mouseGlow * 0.06 * accentColor1;

          // Post-processing - slightly brighter
          color = pow(color, vec3(1.05)) * 1.2;
          
          // Output with slight transparency for layering
          gl_FragColor = vec4(color, 0.85);
      }
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    let mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const render = (time: number) => {
      const parent = canvas.parentElement;
      const width = parent?.clientWidth || window.innerWidth;
      const height = parent?.clientHeight || window.innerHeight;
      
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ background: '#1a1a1f' }}
      data-testid="canvas-mist-background"
    />
  );
};

export default MistBackground;
