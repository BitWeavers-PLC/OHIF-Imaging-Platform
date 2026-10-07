import React from 'react';
import classNames from 'classnames';

import './LoadingIndicatorProgress.css';

/**
 *  A React component that renders a loading indicator.
 * Fork: AxialScope's own scan-sweep mark; a progress line shows only when progress is known.
 * Optionally a textBlock can be provided to display a message
 */
function LoadingIndicatorProgress({ className, textBlock, progress }) {
  const known = progress !== undefined && progress !== null;
  return (
    <div
      className={classNames(
        'absolute top-0 left-0 z-50 flex flex-col items-center justify-center space-y-4',
        className
      )}
      role="status"
    >
      <div className="axialscope-loader">
        <div className="axialscope-loader-scan" />
      </div>
      {known && (
        <div className="bg-primary/20 h-0.5 w-40 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {textBlock}
    </div>
  );
}

export default LoadingIndicatorProgress;
