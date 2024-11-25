import React, { useEffect, useState } from 'react';

export const ImageAnalyzer = ({ imageUrl }) => {
    const [dimensions, setDimensions] = useState(null);

    useEffect(() => {
        if (!imageUrl) return;

        const img = new Image();
        img.onload = () => {
            setDimensions({
                width: img.width,
                height: img.height,
                aspectRatio: (img.width / img.height).toFixed(2)
            });
            console.log(`Image dimensions for ${imageUrl}:`, {
                width: img.width,
                height: img.height,
                aspectRatio: (img.width / img.height).toFixed(2)
            });
        };
        img.src = imageUrl;
    }, [imageUrl]);

    return null; // This component doesn't render anything
};
