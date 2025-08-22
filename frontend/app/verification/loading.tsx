import React from 'react'

const loading = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', // Full viewport height
            width: '100vw',  // Full viewport width
            background: 'transparent'
        }}>
            <img
                src="/loading.gif" // Update with your actual image path
                alt="Loading..."
                style={{
                    width: 80,
                    height: 80,
                    animation: 'spin 1s linear infinite'
                }}
            />
            <style>
                {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
            </style>
        </div>
    )
}

export default loading