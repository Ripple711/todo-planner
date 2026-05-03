import { useEffect, useRef } from 'react';
import { rainFragmentShader } from './rainFragmentShader';

type RainShaderBackgroundProps = {
  enabled?: boolean;
  intensity?: number;
  className?: string;
};

const vertexShaderSource = `
attribute vec2 aPosition;

void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const backgroundSrc = `${import.meta.env.BASE_URL}assets/backgrounds/rainy-mountain.jpg`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Unable to create WebGL shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compile error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, rainFragmentShader);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Unable to create WebGL program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown WebGL program link error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export function RainShaderBackground({
  enabled = true,
  intensity = 0.62,
  className,
}: RainShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      stencil: false,
    });

    if (!gl) {
      return undefined;
    }

    const cnv = canvas;
    const renderer = gl;
    let animationFrame = 0;
    let texture: WebGLTexture | null = null;
    let startTime = performance.now();
    let lastRenderTime = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const dragPerformanceModeRef = { current: false };
    const program = createProgram(renderer);
    const positionLocation = renderer.getAttribLocation(program, 'aPosition');
    const resolutionLocation = renderer.getUniformLocation(program, 'iResolution');
    const timeLocation = renderer.getUniformLocation(program, 'iTime');
    const mouseLocation = renderer.getUniformLocation(program, 'iMouse');
    const channelLocation = renderer.getUniformLocation(program, 'iChannel0');
    const imageResolutionLocation = renderer.getUniformLocation(program, 'uImageResolution');
    const intensityLocation = renderer.getUniformLocation(program, 'uIntensity');
    const positionBuffer = renderer.createBuffer();
    const image = new Image();

    image.src = backgroundSrc;

    function resize() {
      const width = Math.floor(window.innerWidth * pixelRatio);
      const height = Math.floor(window.innerHeight * pixelRatio);
      cnv.width = width;
      cnv.height = height;
      cnv.style.width = `${window.innerWidth}px`;
      cnv.style.height = `${window.innerHeight}px`;
      renderer.viewport(0, 0, width, height);
    }

    function setupGeometry() {
      renderer.bindBuffer(renderer.ARRAY_BUFFER, positionBuffer);
      renderer.bufferData(
        renderer.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        renderer.STATIC_DRAW,
      );
      renderer.enableVertexAttribArray(positionLocation);
      renderer.vertexAttribPointer(positionLocation, 2, renderer.FLOAT, false, 0, 0);
    }

    function setupTexture() {
      texture = renderer.createTexture();
      renderer.activeTexture(renderer.TEXTURE0);
      renderer.bindTexture(renderer.TEXTURE_2D, texture);
      renderer.texParameteri(renderer.TEXTURE_2D, renderer.TEXTURE_WRAP_S, renderer.CLAMP_TO_EDGE);
      renderer.texParameteri(renderer.TEXTURE_2D, renderer.TEXTURE_WRAP_T, renderer.CLAMP_TO_EDGE);
      renderer.texParameteri(renderer.TEXTURE_2D, renderer.TEXTURE_MIN_FILTER, renderer.LINEAR);
      renderer.texParameteri(renderer.TEXTURE_2D, renderer.TEXTURE_MAG_FILTER, renderer.LINEAR);
      renderer.pixelStorei(renderer.UNPACK_FLIP_Y_WEBGL, true);
      renderer.texImage2D(renderer.TEXTURE_2D, 0, renderer.RGBA, renderer.RGBA, renderer.UNSIGNED_BYTE, image);
    }

    function render(now: number) {
      if (dragPerformanceModeRef.current && now - lastRenderTime < 40) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      lastRenderTime = now;
      const elapsed = reducedMotion ? 0 : (now - startTime) / 1000;
      const activeIntensity = dragPerformanceModeRef.current ? intensity * 0.52 : intensity;
      renderer.useProgram(program);
      renderer.activeTexture(renderer.TEXTURE0);
      renderer.bindTexture(renderer.TEXTURE_2D, texture);
      renderer.uniform3f(resolutionLocation, cnv.width, cnv.height, cnv.width / Math.max(1, cnv.height));
      renderer.uniform1f(timeLocation, elapsed);
      renderer.uniform4f(mouseLocation, 0, 0, 0, 0);
      renderer.uniform1i(channelLocation, 0);
      renderer.uniform2f(imageResolutionLocation, image.naturalWidth || 1, image.naturalHeight || 1);
      renderer.uniform1f(intensityLocation, reducedMotion ? intensity * 0.42 : activeIntensity);
      renderer.drawArrays(renderer.TRIANGLES, 0, 6);

      if (!reducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function start() {
      resize();
      setupGeometry();
      setupTexture();
      startTime = performance.now();
      render(startTime);
    }

    function handlePlannerDragStart() {
      dragPerformanceModeRef.current = true;
    }

    function handlePlannerDragEnd() {
      dragPerformanceModeRef.current = false;
    }

    image.onload = start;

    if (image.complete && image.naturalWidth) {
      start();
    }

    window.addEventListener('resize', resize);
    window.addEventListener('planner-task-drag-start', handlePlannerDragStart);
    window.addEventListener('planner-task-drag-end', handlePlannerDragEnd);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('planner-task-drag-start', handlePlannerDragStart);
      window.removeEventListener('planner-task-drag-end', handlePlannerDragEnd);
      window.cancelAnimationFrame(animationFrame);

      if (texture) {
        renderer.deleteTexture(texture);
      }

      if (positionBuffer) {
        renderer.deleteBuffer(positionBuffer);
      }

      renderer.deleteProgram(program);
    };
  }, [enabled, intensity]);

  if (!enabled) {
    return null;
  }

  return <canvas ref={canvasRef} className={`rain-shader-background${className ? ` ${className}` : ''}`} />;
}
