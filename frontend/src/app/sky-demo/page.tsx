"use client";

export default function SkyDemoPage() {
  return (
    <div className="sky-demo-container">
      <div className="clouds">
        <div className="clouds-1"></div>
        {/* <div className="clouds-2"></div> */}
        <div className="clouds-3"></div>
      </div>
      
      <div className="content">
        <h1>안녕 혜진아</h1>
        <p>여기에 말이 뛰어 놀게 하자</p>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css?family=Oswald');

        /* Animation & keyframes */
        @keyframes clouds-loop-1 {
          to { background-position: -1000px 0; }
        }

        @keyframes clouds-loop-2 {
          to { background-position: -1000px 0; }
        }

        @keyframes clouds-loop-3 {
          to { background-position: -1579px 0; }
        }

        .sky-demo-container {
          font-family: 'Oswald', sans-serif;
          height: 100vh;
          padding: 0;
          margin: 0;
          background: linear-gradient(#8FD9FB, #82C8E5);
          text-align: center;
          vertical-align: middle;
          position: relative;
          overflow: hidden;
        }

        .content {
          position: relative;
          z-index: 10;
          padding-top: 50px;
          color: #ffffff;
        }

        .content h1 {
          font-size: 3em;
          margin-bottom: 20px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .content p {
          font-size: 1.2em;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
          
        .clouds {
          opacity: 0.9;
          pointer-events: none;
          position: absolute;
          overflow: hidden;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
        }  
          
        .clouds-1,
        .clouds-2,
        .clouds-3 {
          background-repeat: repeat-x;
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 500px;
        }

        .clouds-1 {
          background-image: url('https://s.cdpn.io/15514/clouds_2.png');
          animation: clouds-loop-1 20s infinite linear;
        }

        .clouds-2 {
          background-image: url('https://s.cdpn.io/15514/clouds_1.png');
          animation: clouds-loop-2 15s infinite linear;
        }

        .clouds-3 {
          background-image: url('https://s.cdpn.io/15514/clouds_3.png');
          animation: clouds-loop-3 17s infinite linear;
        }
      `}</style>
    </div>
  );
}
