import React from 'react';
import './Loading.css';

export const FullPageLoader = () => {
  return (
    <div className="loading-fullpage">
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};

export const InlineLoader = ({ size = 'medium', text = '' }) => {
  return (
    <div className={`loading-inline loading-inline--${size}`}>
      <div className="loading-spinner"></div>
      {text && <span className="loading-inline-text">{text}</span>}
    </div>
  );
};

export const Skeleton = ({ width, height, borderRadius = '4px' }) => {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius }}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-card-header">
        <Skeleton width="60%" height="24px" />
        <Skeleton width="30%" height="16px" />
      </div>
      <Skeleton width="100%" height="16px" />
      <Skeleton width="80%" height="16px" />
      <div className="skeleton-card-footer">
        <Skeleton width="40%" height="32px" borderRadius="16px" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width="100%" height="20px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="100%" height="16px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default FullPageLoader;
