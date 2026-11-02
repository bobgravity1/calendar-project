
import React from 'react';

// type User = {
//     streak: number,
//     today: {
//         kratom: number | null,
//         leg: number | null
//     }
//     name: string,
// }

interface ContainerProps extends React.PropsWithChildren {
    bgImage: string;
}

export const Container = ({ children, bgImage }: ContainerProps) => {
    return (
        <div className='relative isolate flow-root min-h-screen'>
            <div
                aria-hidden='true'
                className='absolute top-0 inset-0 -z-10 bg-cover bg-center bg-no-repeat invert'
                style={{ backgroundImage: `url(${bgImage})` }}
            />
            {children}
        </div>
    );
};
