
import { useEffect, useState } from 'react';

// Predefined hexagon positions and styles to avoid Math.random()
const hexagonPositions = [
  { top: '10%', left: '15%', scale: 1.2, delay: 0.5 },
  { top: '20%', left: '70%', scale: 0.8, delay: 1.0 },
  { top: '30%', left: '40%', scale: 1.5, delay: 1.5 },
  { top: '40%', left: '85%', scale: 1.0, delay: 2.0 },
  { top: '50%', left: '25%', scale: 1.3, delay: 2.5 },
  { top: '60%', left: '60%', scale: 0.9, delay: 0.8 },
  { top: '70%', left: '10%', scale: 1.4, delay: 1.2 },
  { top: '80%', left: '50%', scale: 1.1, delay: 1.8 },
  { top: '90%', left: '30%', scale: 0.7, delay: 2.2 },
  { top: '15%', left: '80%', scale: 1.2, delay: 0.7 },
];

const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading amazing learning experiences');

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, 50);

    const messages = [
      'Loading amazing learning experiences',
      'Gathering knowledge hubs',
      'Connecting mentors and learners',
      'Preparing your personalized path',
    ];

    let msgIndex = 0;
    const messageTimer = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingText(messages[msgIndex]);
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(messageTimer);
    };
  }, []);

  // Decorative hexagons with predefined positions
  const hexPattern = hexagonPositions.map((pos, i) => (
    <div
      key={i}
      className="absolute opacity-10 text-white"
      style={{
        top: pos.top,
        left: pos.left,
        transform: `scale(${pos.scale})`,
        animationDelay: `${pos.delay}s`,
      }}
    >
      <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5Z" />
      </svg>
    </div>
  ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600 overflow-hidden">
      {/* Background hexagons */}
      <div className="absolute inset-0 overflow-hidden">{hexPattern}</div>

      <div className="relative text-center p-8 max-w-md">
        <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-xl relative">
          <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-30"></div>
          <div className="text-4xl font-bold text-blue-600">
            S<span className="text-amber-500">H</span>
          </div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-6">SkillHive</h2>

        <div className="h-2 w-full bg-blue-200 rounded-full mb-4">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="mt-2 text-white text-lg">
          {loadingText}
          <span className="animate-pulse">...</span>
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;