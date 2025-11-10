import React, { useState, useEffect } from 'react';
import { Image } from 'antd';
import type { ImageProps } from 'antd';

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x300?text=No+Image';

interface SafeImageProps extends ImageProps {
    defaultSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
    src,
    defaultSrc = DEFAULT_IMAGE,
    onError,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src);
    const [hasError, setHasError] = useState(false);

    // Update imgSrc when src prop changes
    useEffect(() => {
        if (src !== imgSrc) {
            setImgSrc(src);
            setHasError(false);
        }
    }, [src, imgSrc]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        // Prevent infinite loop
        if (hasError) {
            return;
        }

        // If current src is not default, try default image
        if (imgSrc && imgSrc !== defaultSrc) {
            setImgSrc(defaultSrc);
            setHasError(true);
        } else {
            // If default also fails, call original onError if provided
            setHasError(true);
            onError?.(e);
        }
    };

    return (
        <Image
            {...props}
            src={imgSrc || defaultSrc}
            onError={handleError}
        />
    );
};

