
// import React from 'react'

import dynamic from 'next/dynamic';

const VerificationPage = dynamic(() => import('./_components/Verification'), {
    ssr: false,
});

const page = () => {
    return (
        <div >
            <div>
                Integrating Self Protocol
                <VerificationPage />
            </div>
        </div>
    )
}

export default page