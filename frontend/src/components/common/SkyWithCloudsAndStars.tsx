"use client";

import { useEffect, useRef } from 'react';

// Canvallax 라이브러리 코드
declare global {
  interface Window {
    Canvallax: any;
  }
}

export default function SkyWithCloudsAndStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Canvallax 라이브러리 코드
    const canvallaxCode = `
      !function(){
        function a(a,b){return a.zIndex===b.zIndex?0:a.zIndex<b.zIndex?-1:1}
        function b(){this.width=this.width?this.width:this.image.width,this.height=this.height?this.height:this.image.height}
        var c=window,d=document,e=d.documentElement,f=d.body,g=c.requestAnimationFrame||c.mozRequestAnimationFrame||c.webkitRequestAnimationFrame||c.msRequestAnimationFrame||c.oRequestAnimationFrame||function(a){c.setTimeout(a,20)},h=function(){},i={tracking:"scroll",trackingInvert:!1,x:0,y:0,damping:1,canvas:void 0,className:"",parent:document.body,elements:void 0,animating:!0,fullscreen:!0,preRender:h,postRender:h},j=!1,k=0,l=0,m=function(){k=e.scrollLeft||f.scrollLeft,l=e.scrollTop||f.scrollTop},n=!1,o=0,p=0,q=function(a){o=a.touches?a.touches[0].clientX:a.clientX,p=a.touches?a.touches[0].clientY:a.clientY};
        if(!c.CanvasRenderingContext2D)return c.Canvallax=function(){return!1};
        c.Canvallax=function s(a){if(!(this instanceof s))return new s(a);var b=this;return s.extend(this,i,a),b.canvas=b.canvas||d.createElement("canvas"),b.canvas.className+=" canvallax "+b.className,b.parent.insertBefore(b.canvas,b.parent.firstChild),b.fullscreen?(b.resizeFullscreen(),c.addEventListener("resize",b.resizeFullscreen.bind(b))):b.resize(b.width,b.height),b.ctx=b.canvas.getContext("2d"),b.elements=[],a&&a.elements&&b.addElements(a.elements),b.damping=!b.damping||b.damping<1?1:b.damping,b.render(),b},Canvallax.prototype={_x:0,_y:0,add:function(b){for(var c=b.length?b:arguments,d=c.length,e=0;d>e;e++)this.elements.push(c[e]);return this.elements.sort(a),this},remove:function(a){var b=this.elements.indexOf(a);return b>-1&&this.elements.splice(b,1),this},render:function(){var a=this,b=0,d=a.elements.length,e=0,f=0,h=a.fullscreen||"pointer"!==a.tracking;for(a.animating&&(a.animating=g(a.render.bind(a))),a.tracking&&("scroll"===a.tracking?(j||(j=!0,m(),c.addEventListener("scroll",m),c.addEventListener("touchmove",m)),a.x=k,a.y=l):"pointer"===a.tracking&&(n||(n=!0,c.addEventListener("mousemove",q),c.addEventListener("touchmove",q)),h||(e=a.canvas.offsetLeft,f=a.canvas.offsetTop,h=o>=e&&o<=e+a.width&&p>=f&&p<=f+a.height),h&&(a.x=-o+e,a.y=-p+f)),a.x=!h||a.trackingInvert!==!0&&"invertx"!==a.trackingInvert?a.x:-a.x,a.y=!h||a.trackingInvert!==!0&&"inverty"!==a.trackingInvert?a.y:-a.y),a._x+=(-a.x-a._x)/a.damping,a._y+=(-a.y-a._y)/a.damping,a.ctx.clearRect(0,0,a.width,a.height),a.preRender(a.ctx,a);d>b;b++)a.ctx.save(),a.elements[b]._render(a.ctx,a),a.ctx.restore();return a.postRender(a.ctx,a),this},resize:function(a,b){return this.width=this.canvas.width=a,this.height=this.canvas.height=b,this},resizeFullscreen:function(){return this.resize(c.innerWidth,c.innerHeight)},play:function(){return this.animating=!0,this.render()},pause:function(){return this.animating=!1,this}},Canvallax.createElement=function(){function a(a){var c=b(a);return a._pointCache&&a._pointChecksum===c||(a._pointCache=a.getTransformPoint(),a._pointChecksum=c),a._pointCache}function b(a){return[a.transformOrigin,a.x,a.y,a.width,a.height,a.size].join(" ")}var c=Math.PI/180,d={x:0,y:0,distance:1,fixed:!1,opacity:1,fill:!1,stroke:!1,lineWidth:!1,transformOrigin:"center center",scale:1,rotation:0,preRender:h,render:h,postRender:h,init:h,crop:!1,getTransformPoint:function(){var a=this,b=a.transformOrigin.split(" "),c={x:a.x,y:a.y};return"center"===b[0]?c.x+=a.width?a.width/2:a.size:"right"===b[0]&&(c.x+=a.width?a.width:2*a.size),"center"===b[1]?c.y+=a.height?a.height/2:a.size:"bottom"===b[1]&&(c.y+=a.height?a.height:2*a.size),c},_render:function(b,d){var e=this,f=e.distance||1,g=d._x,h=d._y,i=a(e);return e.preRender.call(e,b,d),e.blend&&(d.ctx.globalCompositeOperation=e.blend),d.ctx.globalAlpha=e.opacity,d.ctx.translate(i.x,i.y),e.scale===!1?(g*=f,h*=f):d.ctx.scale(f,f),e.fixed||d.ctx.translate(g,h),e.scale!==!1&&d.ctx.scale(e.scale,e.scale),e.rotation&&d.ctx.rotate(e.rotation*c),d.ctx.translate(-i.x,-i.y),e.crop&&(b.beginPath(),"function"==typeof e.crop?e.crop.call(e,b,d):b.rect(e.crop.x,e.crop.y,e.crop.width,e.crop.height),b.clip(),b.closePath()),e.outline&&(b.beginPath(),b.rect(e.x,e.y,e.width||2*e.size,e.height||2*e.size),b.closePath(),b.strokeStyle=e.outline,b.stroke()),e.render.call(e,b,d),this.fill&&(b.fillStyle=this.fill,b.fill()),this.stroke&&(this.lineWidth&&(b.lineWidth=this.lineWidth),b.strokeStyle=this.stroke,b.stroke()),e.postRender.call(e,b,d),e},clone:function(a){var a=Canvallax.extend({},this,a);return new this.constructor(a)}};return function(a){function b(a){return this instanceof b?(Canvallax.extend(this,a),this.init.apply(this,arguments),this):new b(a)}return b.prototype=Canvallax.extend({},d,a),b.prototype.constructor=b,b.clone=b.prototype.clone,b}}(),Canvallax.extend=function(a){a=a||{};var b=arguments.length,c=1;for(1===arguments.length&&(a=this,c=0);b>c;c++)if(arguments[c])for(var d in arguments[c])arguments[c].hasOwnProperty(d)&&(a[d]=arguments[c][d]);return a};var r=2*Math.PI;Canvallax.Circle=Canvallax.createElement({size:20,render:function(a){a.beginPath(),a.arc(this.x+this.size,this.y+this.size,this.size,0,r),a.closePath()}}),Canvallax.Element=Canvallax.createElement(),Canvallax.Image=Canvallax.createElement({src:null,image:null,width:null,height:null,init:function(a){this.image=this.image&&1===this.image.nodeType?this.image:a&&1===a.nodeType?a:new Image,b.bind(this)(),this.image.onload=b.bind(this),this.image.src=this.image.src||a.src||a},render:function(a){this.image&&a.drawImage(this.image,this.x,this.y,this.width,this.height)}});var r=2*Math.PI;Canvallax.Polygon=Canvallax.createElement({sides:6,size:20,render:function(a){var b=this.sides;for(a.translate(this.x+this.size,this.y+this.size),a.beginPath(),a.moveTo(this.size,0);b--;)a.lineTo(this.size*Math.cos(b*r/this.sides),this.size*Math.sin(b*r/this.sides));a.closePath()}}),Canvallax.Rectangle=Canvallax.createElement({width:100,height:100,render:function(a){a.beginPath(),a.rect(this.x,this.y,this.width,this.height),a.closePath()}})}();
    `;

    // Canvallax 라이브러리 로드
    const script = document.createElement('script');
    script.textContent = canvallaxCode;
    document.head.appendChild(script);

    // 초기화 코드
    const initCode = () => {
      if (typeof window.Canvallax === 'undefined') {
        setTimeout(initCode, 100);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Canvas 요소를 우리가 원하는 컨테이너에 직접 추가
      const container = document.querySelector('.sky-container');
      if (!container) return;

      const canvas = document.createElement('canvas');
      canvas.className = 'bg-canvas';
      container.appendChild(canvas);

      const can = window.Canvallax({
        canvas: canvas,
        className: 'bg-canvas',
        damping: 40,
        tracking: 'pointer',
        parent: container as HTMLElement,
        fullscreen: false,
        width: width,
        height: height
      });

      // 고정 하늘색 그라디언트 배경 (마우스 움직임에 영향받지 않음)
      const skyGradient = window.Canvallax.Rectangle({
        width: width,
        height: height,
        x: 0,
        y: 0,
        distance: 0, // distance 0으로 설정하여 고정
        fixed: true, // fixed true로 설정하여 마우스 움직임 무시
        zIndex: 0,
        fill: (function(){
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const gradient = ctx!.createLinearGradient(0,0,0,height);
          gradient.addColorStop(0,'#8edbff');  // 상단: baby blue
          gradient.addColorStop(1,'#d3f0fe');  // 하단: 연한 하늘색
          return gradient;
        })()
      });

      can.add(skyGradient);

      // 화면 높이 구간별 분포 설정 (구름만)
      const top5Percent = height * 0.05;      // 상위 5% 영역 (구름 10%)
      const top20Percent = height * 0.15;     // 상위 5%~20% 영역 (구름 30%)
      const top70Percent = height * 0.50;     // 상위 20%~70% 영역 (구름 60%)
      const bottom30Percent = height * 0.30;  // 하위 30% 영역 (구름 0%)

      function randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      // 별 생성 - 구름과 같은 비율로 분포 (주석처리)
      // const STAR_COUNT = 300;
      
      // 화면 높이 구간별 별 분포 설정 (구름과 동일) (주석처리)
      // const starsTop50 = Math.floor(STAR_COUNT * 0.5);     // 상위 별 개수
      // const starsMiddle50 = Math.floor(STAR_COUNT * 0.5);  // 중간 별 개수
      // const starsBottom0 = 0;                              // 하위 별 개수

      // 구간별 별 배치 함수 (주석처리)
      // function createStarsInZone(starCount: number, zoneHeight: number, startY: number) {
      //   const stars = [];
      //   let i = starCount;
        
      //   while(i--) {
      //     const distance = randomRange(0.1, 0.3);
      //     const x = Math.random() * width;
          
      //     // Y 좌표를 해당 구간 내로 제한
      //     const adjustedY = Math.min(Math.max(Math.random() * zoneHeight, startY), startY + zoneHeight);
          
      //     stars.push(
      //       window.Canvallax.Circle({
      //         x: x,
      //         y: adjustedY,
      //         distance: distance,
      //         size: 4,
      //         fill: '#FFF',
      //         zIndex: 1, // 하늘색 그라디언트 위에 표시
      //       })
      //     );
      //   }
        
      //   return stars;
      // }

      // 상위 30% 구간 (Y: 0 ~ top30Percent) - 별 50% (주석처리)
      // const topStars = createStarsInZone(starsTop50, top30Percent, 0);
      
      // 중간 50% 구간 (Y: top30Percent ~ top30Percent + middle50Percent) - 별 50% (주석처리)
      // const middleStars = createStarsInZone(starsMiddle50, middle50Percent, top30Percent);
      
      // 하위 20% 구간 (Y: top30Percent + middle50Percent ~ height) - 별 0% (주석처리)
      // 별 생성하지 않음
      
      // 모든 별을 캔버스에 추가 (주석처리)
      // const allStars = [...topStars, ...middleStars];
      // can.add(allStars);

      // 구름 생성
      const CLOUD_COUNT = 40;
      const CLOUD_WIDTH = 510;
      const CLOUD_HEIGHT = 260;
      
      const cloudsTop10 = Math.floor(CLOUD_COUNT * 0.1);     // 상위 5% 구름 개수 (10%)
      const cloudsTop30 = Math.floor(CLOUD_COUNT * 0.3);     // 상위 5%~20% 구름 개수 (30%)
      const cloudsTop60 = Math.floor(CLOUD_COUNT * 0.6);     // 상위 20%~70% 구름 개수 (60%)
      const cloudsBottom0 = 0;                               // 하위 30% 구름 개수 (0%)

      function bestCandidateSampler(width: number, height: number, numCandidates: number) {
        const samples: number[][] = [];

        function findDistance(a: number[], b: number[]) {
          const dx = a[0] - b[0];
          const dy = a[1] - b[1];
          return dx * dx + dy * dy;
        }

         function findClosest(c: number[]){
           if (samples.length === 0) return c;
           
           let i = samples.length;
           let sample: number[];
           let closest: number[] = samples[0];
           let distance: number;
           let closestDistance: number = Number.MAX_VALUE;

           while(i--){
             sample = samples[i];
             distance = findDistance(sample, c);

             if (distance < closestDistance) {
               closest = sample;
               closestDistance = distance;
             }
           }

           return closest;
         }

        function getSample() {
          let bestCandidate: number[] = [Math.random() * width, Math.random() * height];
          let bestDistance = 0;
          let i = 0;
          let c: number[], d: number;

          c = [Math.random() * width, Math.random() * height];

          if ( samples.length < 1 ) {
            bestCandidate = c;
          } else {
            for (; i < numCandidates; i++) {
              c = [Math.random() * width, Math.random() * height];
              d = findDistance(findClosest(c), c);

              if (d > bestDistance) {
                bestDistance = d;
                bestCandidate = c;
              }
            }
          }

          samples.push(bestCandidate);
          return bestCandidate;
        }

        getSample.all = function(){ return samples; };
        getSample.samples = samples;

        return getSample;
      }

      function randomizedCloud(image: HTMLImageElement){
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const width = canvas.width = randomRange(400, 700);
        const height = canvas.height = randomRange(200, 260);
        const w = image.width;
        const h = image.height;
        const halfw = w / 2;
        const halfh = h / 2;
        let i = Math.ceil(randomRange(20, 90));
        let randScale: number;
        const maxScale = 2.5;
        const fullPi = Math.PI / 2;

        while (i--){
          randScale = randomRange(0.4, maxScale);
          ctx.globalAlpha = Math.random() - 0.2;
          ctx.translate(randomRange(halfw, width - (w * maxScale * 1.3)), randomRange(halfh + halfh / 4, height - (h * maxScale)));
          ctx.scale(randScale, randomRange(randScale - 0.3, randScale));
          ctx.translate(halfw, halfh);
          ctx.rotate(randomRange(0, fullPi));
          ctx.drawImage(image, -halfw, -halfh);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        return canvas;
      }

      // 구간별 구름 배치 함수 - 한번에 생성
      function createCloudsInZone(cloudCount: number, zoneHeight: number, startY: number): void {
        for (let i = 0; i < cloudCount; i++) {
          const rand = randomRange(0.4, 1.2);
          
          // X, Y 좌표 생성
          const x = Math.random() * (width + 200) - 100; // 화면 밖에서도 시작 가능
          const y = startY + Math.random() * zoneHeight;
          
          // 구름 생성 (시간차 없이 한번에)
          const tex = randomizedCloud(cloudImg);
          
          const cloud = window.Canvallax.Image({
            image: tex,
            width: tex.width,
            height: tex.height,
            zIndex: 1 + (rand * 13),
            x: x,
            y: y,
            opacity: (rand < 0.8 ? 0.8 : rand),
            distance: 0,
            fixed: true,
            maxX: width + 200, // 화면 밖까지 확장
            speed: rand * randomRange(0.1, 0.3), // 속도 조정
            postRender: function(){
              this.x = this.x - this.speed;
              // 화면 왼쪽으로 완전히 사라지면 오른쪽으로 리셋
              if (this.x < -this.width - 100) {
                this.x = this.maxX + Math.random() * 200;
              }
            }
          });
          
          can.add(cloud);
        }
      }

      const cloudImg = new Image();
      cloudImg.addEventListener('load', function(){
        // 상위 5% 구간 (Y: 0 ~ top5Percent) - 구름 10%
        createCloudsInZone(cloudsTop10, top5Percent, 0);
        
        // 상위 5%~20% 구간 (Y: top5Percent ~ top5Percent + top20Percent) - 구름 30%
        createCloudsInZone(cloudsTop30, top20Percent, top5Percent);
        
        // 상위 20%~70% 구간 (Y: top5Percent + top20Percent ~ top5Percent + top20Percent + top70Percent) - 구름 60%
        createCloudsInZone(cloudsTop60, top70Percent, top5Percent + top20Percent);
        
        // 하위 30% 구간 (Y: top5Percent + top20Percent + top70Percent ~ height) - 구름 0%
        // 구름 생성하지 않음

        can.render();
      });

      cloudImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEYAAABGCAMAAABG8BK2AAAAYFBMVEX///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8GYpHzAAAAIHRSTlMAAwcLDxIWGh8kKzI5QEhPVl9qc3uEi5Sdpa64wcrV4c6KdP8AAAOeSURBVHgBndQJkvM8DoNhS+nv/ieONBH8FIs1nb83ZLfF1wBFZ17vNMZ8fPz79/GY46Xre8F85kRzzhdk/A2TOpSARpF/g0mdaI8XZjg47leA32Jo3wbEooNE/SFGrPOAiPxC+xaDAxBTxQqFoW8wGGof89E4j8nQUceo621h/KY8GuXx4Mg10vRZlPd55JCEnXlIQX7cE8pNp8Dob4oY8LjZTny8QEMo2o2hSqT5YImxchVNbpgZ3oVR4xVUgOlGS5fFKCPSWDY4Yu1xIKyEEqLfE0UUKcoJ9MFVsAhnaOpEGW4gyxFyLitOeRhZO8NJur1hKpWWCV03oaG9yYcYXvD7UPbetVOMNwqlWH6/b7sp29G1Z5g6LFGaY9uYB2A6M7evtVco3U3M1CCopOlNY8Q7cdZahxIMTpv7meR2NghWDqdu8MTZzwMqN+RaBkmdUgf7wMfN1d1cNSAFMdhQ3tLXu2STuclylwYL5QYhsGyLz499bcgxK1F5SmumvaoRrIwSjYutaGbVZIgze6wegLO6i8MD2kJ1N1cYKAUXTLnRWxtnYrMONWRRD+EsA3utw4mnKxNCZRgplK5T05ycvaaZCmtAOEKl+p4ge70k06mcdrQoPgGpbY1EboNyY7/ZHVsfK1BLhBAdCA5MGd719b0gUOJmg9vc5hf3E+K2y1EQDnCjxoGs3t84WiA6zI253rVy6MRnSKNxJtQcRY3xL90MkN6DYGZHI3zBMaF1NcoUQ3Oll+9RBqHb1uIzSTmv9LtQOJbC7Ci/fRsivh0+sBrYwix3GKe8No5yHJTDaZqhqOp8KC6BdmXrFKFaXUUWk7uCLsRPbuAZrmsPjCANBKChIZj/97IBzSJq3pgpymiYRmnxMLG9YbinUGCk5rxbUhJDy/yH+C5U3wP1FQWDL5AtWpNQm0IRz/ys+psCTSKuCObTjY3KhLoCrbUY7ZgIqHRXrTSFHxwfFjcM1fWF8devtJPK2XtM6nAOpcrCXDlVR967qRi6XOY78NJsi95gcsJynMXF2k6gAFFhVFGLz0loz5u0HGoEGF6qOoVgC6cOB6iBb0Ixue66p+p8F+v17VkhUTqGXP6pVptC8JU07z0Ga5VqjmUpvBvuC8wpej4bJiXK+ZHnazfXyfUSipxPVJQvMTjppUKlFUVvv8PIVftrSIRD+Q6DQ7a47wzE9xjaYJk1Fty1v8CYauOLm+fv3Cikjv4lBqVCAP6n/gfZhdXQlm1mfwAAAABJRU5ErkJggg==';
    };

    initCode();

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      // Canvas 정리
      const container = document.querySelector('.sky-container');
      const canvas = document.querySelector('.bg-canvas');
      if (container && canvas) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <>
      <style jsx>{`
        .sky-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, #b8c4d0 40%, #97a8c0 80%);
          background-size: cover;
          overflow: hidden;
        }
        
        .bg-canvas {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          width: 100%;
          height: 100%;
          margin: 0;
          background: transparent; /* Canvas 배경을 투명하게 설정 */
        }
      `}</style>
      <div className="sky-container">
        <canvas ref={canvasRef} className="bg-canvas" />
      </div>
    </>
  );
}
