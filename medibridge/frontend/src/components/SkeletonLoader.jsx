import React from 'react';

const SkeletonLoader = ({ type = 'card', count = 3 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card glass-card">
                        <div className="skeleton-header">
                            <div className="skeleton-icon pulse" />
                            <div className="skeleton-label pulse" />
                        </div>
                        <div className="skeleton-line pulse" />
                        <div className="skeleton-line pulse shorter" />
                        <div className="skeleton-footer pulse" />
                    </div>
                );
            case 'doctor':
                return (
                    <div className="skeleton-doctor-card glass-card">
                        <div className="skeleton-img pulse" />
                        <div className="skeleton-info">
                            <div className="skeleton-line pulse" />
                            <div className="skeleton-line pulse shorter" />
                            <div className="skeleton-badges">
                                <div className="skeleton-badge pulse" />
                                <div className="skeleton-badge pulse" />
                            </div>
                        </div>
                    </div>
                );
            default:
                return <div className="skeleton-line pulse" />;
        }
    };

    return (
        <div className={`skeleton-container skeleton-${type}`}>
            {Array(count).fill(0).map((_, i) => (
                <React.Fragment key={i}>
                    {renderSkeleton()}
                </React.Fragment>
            ))}
        </div>
    );
};

export default SkeletonLoader;
