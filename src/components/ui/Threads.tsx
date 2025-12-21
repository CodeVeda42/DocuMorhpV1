import React, { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Color } from "ogl";

interface ThreadsProps {
  color?: [number, number, number];
  amplitude?: number;
  distance?: number;
  enableMouseInteraction?: boolean;
  className?: string;
}

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main(){
vUv=uv;
gl_Position=vec4(position,0.0,1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;
#define PI 3.1415926538
const int u_line_count=40;
const float u_line_width=7.0;
const float u_line_blur=10.0;

float Perlin2D(vec2 P){
vec2 Pi=floor(P);
vec4 Pf=P.xyxy-vec4(Pi,Pi+1.0);
vec4 Pt=vec4(Pi.xy,Pi.xy+1.0);
Pt=Pt-floor(Pt*(1.0/71.0))*71.0;
Pt+=vec2(26.0,161.0).xyxy;
Pt*=Pt;
Pt=Pt.xzxz*Pt.yyww;
vec4 hx=fract(Pt*(1.0/951.135664));
vec4 hy=fract(Pt*(1.0/642.949883));
vec4 gx=hx-0.49999;
vec4 gy=hy-0.49999;
vec4 gr=inversesqrt(gx*gx+gy*gy)*(gx*Pf.xzxz+gy*Pf.yyww);
gr*=1.4142135623730950;
vec2 b=Pf.xy*Pf.xy*Pf.xy*(Pf.xy*(Pf.xy*6.0-15.0)+10.0);
vec4 b2=vec4(b,vec2(1.0-b));
return dot(gr,b2.zxzx*b2.wwyy);
}

float pixel(float c,vec2 r){
return(1.0/max(r.x,r.y))*c;
}

float lineFn(vec2 st,float w,float p,float o,vec2 m,float t,float a,float d){
float so=p*0.4;
float sp=0.1+so;
float an=smoothstep(sp,0.7,st.x);
float fa=an*0.5*a*(1.0+(m.y-0.5)*0.2);
float ts=t/10.0+(m.x-0.5);
float bl=smoothstep(sp,sp+0.05,st.x)*p;
float xn=mix(
Perlin2D(vec2(ts,st.x+p)*2.5),
Perlin2D(vec2(ts,st.x+ts)*3.5)/1.5,
st.x*0.3);
float y=0.5+(p-0.5)*d+xn/2.0*fa;
float ls=smoothstep(y+(w/2.0)+(u_line_blur*pixel(1.0,iResolution.xy)*bl),y,st.y);
float le=smoothstep(y,y-(w/2.0)-(u_line_blur*pixel(1.0,iResolution.xy)*bl),st.y);
return clamp((ls-le)*(1.0-smoothstep(0.0,1.0,pow(p,0.3))),0.0,1.0);
}

void mainImage(out vec4 fc,in vec2 frag){
vec2 uv=frag/iResolution.xy;
float ls=1.0;
for(int i=0;i<u_line_count;i++){
float p=float(i)/float(u_line_count);
ls*=1.0-lineFn(
uv,
u_line_width*pixel(1.0,iResolution.xy)*(1.0-p),
p,(PI*p),uMouse,iTime,uAmplitude,uDistance);
}
float cv=1.0-ls;
fc=vec4(uColor*cv,cv);
}

void main(){
mainImage(gl_FragColor,gl_FragCoord.xy);
}
`;

const Threads: React.FC<ThreadsProps> = ({
  color = [1, 1, 1],
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Cleanup existing canvas if any
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const renderer = new Renderer({ alpha: true });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) }
      }
    });
    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      program.uniforms.iResolution.value.r = clientWidth;
      program.uniforms.iResolution.value.g = clientHeight;
      program.uniforms.iResolution.value.b = clientWidth / clientHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e: MouseEvent) {
      const r = container.getBoundingClientRect();
      targetMouse = [(e.clientX - r.left) / r.width, 1.0 - (e.clientY - r.top) / r.height];
    }
    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }
    if (enableMouseInteraction) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    function update(t: number) {
      if (enableMouseInteraction) {
        const s = 0.05;
        currentMouse[0] += s * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += s * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }
      program.uniforms.iTime.value = t * 0.001;
      renderer.render({ scene: mesh });
      animationFrameId.current = requestAnimationFrame(update);
    }
    animationFrameId.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", resize);
      if (enableMouseInteraction) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [color, amplitude, distance, enableMouseInteraction]);

  return <div ref={containerRef} className={`w-full h-full relative ${rest.className || ''}`} {...rest} />;
};
export default Threads;
