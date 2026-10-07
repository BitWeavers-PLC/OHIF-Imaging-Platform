import React, { useState, useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle } from '../Dialog/Dialog';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { Button } from '../Button/Button';
import { useNotification } from '../../contextProviders';
import { requestFailureWording } from './requestFailureWording';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Parses an error stack trace to extract important information
 * Extracts the first function name from the stack trace
 */
const parseErrorStack = (error: ErrorBoundaryError) => {
  if (!error.stack) {
    return { filePath: null, errorTitle: null, code: null, firstFilename: null };
  }

  const stack = error.stack;
  const stackLines = stack.split('\n');

  // Extract error message from first line
  const errorMessage = stackLines[0].trim();

  // Extract first function name from the stack trace
  let firstFilename = null;

  // Find the first stack line (starts with " at ")
  for (let i = 1; i < stackLines.length; i++) {
    const line = stackLines[i].trim();
    if (line.startsWith('at ')) {
      // Extract function name pattern
      const match = line.match(/at\s+([^\s(]+)[\s(]/);
      if (match && match[1]) {
        firstFilename = match[1];
        break;
      }
    }
  }

  // Sanitize stack trace for display - safer approach to avoid ReDoS
  const sanitizedStack = stackLines
    .map(line => {
      // Limit line length to prevent excessive processing
      const limitedLine = line.substring(0, 2000);

      // Process each part separately to avoid complex regex patterns
      if (limitedLine.includes('(')) {
        // Extract filename from paths in parentheses
        const openParenIndex = limitedLine.indexOf('(');
        const closeParenIndex = limitedLine.indexOf(')', openParenIndex);

        if (openParenIndex >= 0 && closeParenIndex > openParenIndex) {
          const pathInParens = limitedLine.substring(openParenIndex + 1, closeParenIndex);

          // Find the last segment after slash or backslash
          const lastSlashIndex = Math.max(
            pathInParens.lastIndexOf('/'),
            pathInParens.lastIndexOf('\\')
          );

          if (lastSlashIndex >= 0) {
            const filename = pathInParens.substring(lastSlashIndex + 1);
            return (
              limitedLine.substring(0, openParenIndex + 1) +
              filename +
              limitedLine.substring(closeParenIndex)
            );
          }
        }
      }

      // Handle the "at Function path:line:column" format
      if (limitedLine.includes(' at ')) {
        const atIndex = limitedLine.indexOf(' at ');
        const afterAt = limitedLine.substring(atIndex + 4).trim();

        // Split by whitespace to separate function and path
        const spaceAfterFunc = afterAt.indexOf(' ');

        if (spaceAfterFunc > 0) {
          const funcName = afterAt.substring(0, spaceAfterFunc);
          const path = afterAt.substring(spaceAfterFunc + 1);

          // Check if this is a path with line/column numbers
          if (path.includes(':') && /.*:[0-9]+:[0-9]+/.test(path)) {
            // Find the last segment after slash or backslash
            const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));

            if (lastSlashIndex >= 0) {
              const filename = path.substring(lastSlashIndex + 1);
              return limitedLine.substring(0, atIndex + 4) + funcName + ' ' + filename;
            }
          }
        }
      }

      return limitedLine;
    })
    .join('\n');

  return {
    errorTitle: errorMessage,
    code: sanitizedStack,
    firstFilename: firstFilename,
  };
};

interface ErrorBoundaryError extends Error {
  message: string;
  stack?: string;
}

enum ShowErrorDetails {
  always = 'always',
  dev = 'dev',
  production = 'production',
}

interface DefaultFallbackProps extends FallbackProps {
  error: ErrorBoundaryError;
  context: string;
  resetErrorBoundary: () => void;
  showErrorDetails?: ShowErrorDetails;
}

interface ErrorBoundaryProps {
  context?: string;
  onReset?: () => void;
  onError?: (error: ErrorBoundaryError, componentStack: string, context: string) => void;
  fallbackComponent?: React.ComponentType<DefaultFallbackProps>;
  children: React.ReactNode;
  fallbackRoute?: string | null;
  isPage?: boolean;
  showErrorDetails?: ShowErrorDetails;
}

const DefaultFallback = ({
  error,
  context,
  resetErrorBoundary = () => {},
  showErrorDetails,
}: DefaultFallbackProps) => {
  const supportUrl =
    (window as any)?.config?.brand?.supportUrl || 'https://support.imagingplatform.local';
  const isShowDetailsButtonVisible =
    showErrorDetails == null ||
    showErrorDetails === ShowErrorDetails.always ||
    (showErrorDetails === ShowErrorDetails.dev && !isProduction) ||
    (showErrorDetails === ShowErrorDetails.production && isProduction);

  const { t } = useTranslation('ErrorBoundary');
  const [showDetails, setShowDetails] = useState(false);
  const { show } = useNotification();

  // Fork: plain wording for readers (no internal route/context names); details stay behind
  // "Show Details" (dev only by default, see showErrorDetails).
  const requestFailure = requestFailureWording(error, t);
  const title = requestFailure?.title ?? t('That action could not be completed');
  const subtitle = requestFailure?.subtitle ?? t('The viewer is still usable. Please try again.');

  const { errorTitle, code, firstFilename } = parseErrorStack(error);

  const copyErrorToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      show({
        title: t('Success'),
        message: t('Error copied to clipboard'),
        type: 'success',
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    // Use a stable ID based on error message to support deduplication
    const errorId = `error-${errorTitle || error.message}`;

    // We don't need to track shown state - instead rely on the notification deduplication system
    show({
      title,
      message: subtitle,
      type: 'error',
      // Fork: fades after a few seconds instead of staying over the images.
      duration: 6000,
      id: errorId,
      action: isShowDetailsButtonVisible
        ? {
            label: t('Details'),
            onClick: () => setShowDetails(true),
          }
        : undefined,
    });
  }, [error, errorTitle, subtitle, t, title, show]);

  return (
    <Dialog
      open={showDetails}
      onOpenChange={setShowDetails}
    >
      <DialogTitle className="invisible">{errorTitle}</DialogTitle>
      {/* Fork: plain title bar + stack + actions, matching the viewer's dialogs. */}
      <DialogContent
        className="bg-popover max-w-3xl gap-0 overflow-hidden rounded-sm border p-0"
        onInteractOutside={e => e.preventDefault()}
      >
        <div className="border-border border-b border-l-4 !border-l-[hsl(var(--error-text))] px-5 py-3">
          <h2 className="text-foreground text-base font-medium">{title}</h2>
          <p className="text-muted-foreground mt-0.5 break-words text-sm">
            {errorTitle || error.message}
          </p>
        </div>

        {code && (
          <div className="px-5 pt-4">
            <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
              <span className="truncate">{firstFilename || t('Error stack')}</span>
            </div>
            <ScrollArea className="bg-background text-foreground h-[300px] rounded-sm border">
              <div className="p-3 font-mono text-xs">
                {code.split('\n').map((line, index) => (
                  <div
                    key={index}
                    className="flex"
                  >
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <Button
            variant="link"
            className="text-primary mr-auto p-0"
            onClick={() => window.open(supportUrl, '_blank')}
          >
            {t('Report issue')}
          </Button>
          {code && (
            <Button
              variant="secondary"
              className="!rounded-sm"
              onClick={copyErrorToClipboard}
              title={t('Copy error')}
            >
              {t('Copy')}
            </Button>
          )}
          <Button
            className="!rounded-sm"
            onClick={() => setShowDetails(false)}
          >
            {t('Close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ErrorBoundary = ({
  context = (window as any)?.config?.brand?.appName || 'AxialScope',
  onReset = () => {},
  onError = _error => {},
  fallbackComponent: FallbackComponent = DefaultFallback,
  children,
  showErrorDetails,
}: ErrorBoundaryProps) => {
  const [error, setError] = useState<ErrorBoundaryError | null>(null);

  const onResetHandler = () => {
    setError(null);
    onReset();
  };

  // Add error event listener to window
  useEffect(() => {
    let errorTimeout: NodeJS.Timeout;

    const handleError = (event: ErrorEvent) => {
      clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        setError(event.error);
        onErrorHandler(event.error, null);
      }, 100);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      // Fork: name the failing request, which the stack (inside the XHR client) cannot.
      if (event.reason?.request?.responseURL) {
        console.warn(
          'Image server request failed',
          event.reason.status,
          event.reason.request.responseURL
        );
      }
      clearTimeout(errorTimeout);
      errorTimeout = setTimeout(() => {
        setError(event.reason || event);
        onErrorHandler(event.reason || event, null);
      }, 100);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      clearTimeout(errorTimeout);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const onErrorHandler = (
    error: ErrorBoundaryError | ErrorEvent,
    componentStack: string | null
  ) => {
    console.debug(`${context} Error Boundary`, error, componentStack, context);
    onError(error, componentStack || '', context);
  };

  return (
    <ReactErrorBoundary
      fallbackRender={props => (
        <FallbackComponent
          {...props}
          context={context}
          showErrorDetails={showErrorDetails}
        />
      )}
      onReset={onResetHandler}
      onError={(error, info) => onErrorHandler(error as ErrorBoundaryError, info.componentStack)}
    >
      <>
        {children}
        {error && (
          <FallbackComponent
            error={error}
            context={context}
            resetErrorBoundary={() => setError(null)}
            showErrorDetails={showErrorDetails}
          />
        )}
      </>
    </ReactErrorBoundary>
  );
};

export { ErrorBoundary };
