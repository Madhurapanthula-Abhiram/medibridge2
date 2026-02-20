import React, { useState, useEffect } from 'react';

const CSSEnzymeAnimation = () => {
  const [currentOrgan, setCurrentOrgan] = useState('Heart');
  const [organIndex, setOrganIndex] = useState(0);

  const organs = [
    { name: 'Heart', color: '#ef4444', shape: 'heart' },
    { name: 'Brain', color: '#8b5cf6', shape: 'brain' },
    { name: 'Lungs', color: '#06b6d4', shape: 'lungs' },
    { name: 'Kidney', color: '#f59e0b', shape: 'kidney' },
    { name: 'DNA', color: '#ec4899', shape: 'dna' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setOrganIndex((prev) => (prev + 1) % organs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentOrgan(organs[organIndex].name);
  }, [organIndex]);

  const currentOrganData = organs[organIndex];

  return (
    <div 
      className="css-organ-container"
      style={{
        width: '100%',
        height: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        background: 'radial-gradient(circle, rgba(192, 38, 211, 0.1) 0%, rgba(0, 212, 170, 0.05) 100%)',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}
    >
      {/* Background particles */}
      <div className="css-particles">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="css-particle"
            style={{
              position: 'absolute',
              width: '6px',
              height: '6px',
              background: currentOrganData.color,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      {/* Main organ shape */}
      <div 
        className={`css-organ-shape css-organ-${currentOrganData.shape}`}
        style={{
          width: '200px',
          height: '200px',
          position: 'relative',
          animation: 'pulse 2s ease-in-out infinite',
          transition: 'all 0.5s ease'
        }}
      >
        {currentOrganData.shape === 'heart' && (
          <div style={{
            width: '100%',
            height: '100%',
            background: currentOrganData.color,
            clipPath: 'path("M100,30 C70,0 20,0 20,40 C20,80 100,120 100,180 C100,120 180,80 180,40 C180,0 130,0 100,30 Z")',
            animation: 'beat 1.2s ease-in-out infinite'
          }} />
        )}
        
        {currentOrganData.shape === 'brain' && (
          <div style={{
            width: '100%',
            height: '100%',
            background: currentOrganData.color,
            borderRadius: '50% 50% 40% 40%',
            position: 'relative',
            animation: 'morph 3s ease-in-out infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              width: '15px',
              height: '15px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              top: '20%',
              right: '30%',
              width: '15px',
              height: '15px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }} />
          </div>
        )}
        
        {currentOrganData.shape === 'lungs' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            width: '100%',
            height: '100%'
          }}>
            <div style={{
              width: '70px',
              height: '120px',
              background: currentOrganData.color,
              borderRadius: '50%',
              clipPath: 'ellipse(40% 60% at 30% 50%)',
              animation: 'breathe 2s ease-in-out infinite'
            }} />
            <div style={{
              width: '70px',
              height: '120px',
              background: currentOrganData.color,
              borderRadius: '50%',
              clipPath: 'ellipse(40% 60% at 70% 50%)',
              animation: 'breathe 2s ease-in-out infinite reverse'
            }} />
          </div>
        )}
        
        {currentOrganData.shape === 'kidney' && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '30px',
            width: '100%',
            height: '100%'
          }}>
            <div style={{
              width: '80px',
              height: '120px',
              background: currentOrganData.color,
              borderRadius: '40% 10% 40% 10%',
              transform: 'rotate(20deg)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
            <div style={{
              width: '80px',
              height: '120px',
              background: currentOrganData.color,
              borderRadius: '10% 40% 10% 40%',
              transform: 'rotate(-20deg)',
              animation: 'pulse 2s ease-in-out infinite reverse'
            }} />
          </div>
        )}
        
        {currentOrganData.shape === 'dna' && (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '120px',
                  height: '8px',
                  background: currentOrganData.color,
                  borderRadius: '4px',
                  transform: `rotate(${i % 2 === 0 ? '30deg' : '-30deg'})`,
                  animation: `dnaPulse 1.5s ease-in-out infinite ${i * 0.2}s`
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Organ label */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${currentOrganData.color}`,
          borderRadius: '2rem',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: currentOrganData.color,
            boxShadow: `0 0 10px ${currentOrganData.color}`,
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <span
          style={{
            color: currentOrganData.color,
            fontSize: '0.9rem',
            fontWeight: 500,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          {currentOrgan}
        </span>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-5px) translateX(-5px); }
          75% { transform: translateY(-15px) translateX(3px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes beat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
        
        @keyframes morph {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.05) rotate(5deg); }
          50% { transform: scale(0.95) rotate(0deg); }
          75% { transform: scale(1.05) rotate(-5deg); }
        }
        
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes dnaPulse {
          0%, 100% { opacity: 0.7; transform: scale(1) rotate(30deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(35deg); }
        }
      `}</style>
    </div>
  );
};

export default CSSEnzymeAnimation;