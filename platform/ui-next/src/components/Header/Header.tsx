import React, { ReactNode, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Icons,
  Button,
  ToolButton,
} from '../';
import { IconPresentationProvider } from '@ohif/ui-next';

import NavBar from '../NavBar';

const MEASUREMENT_TOLERANCE_PX = 1;

// Todo: we should move this component to composition and remove props base

interface HeaderProps {
  children?: ReactNode;
  menuOptions: Array<{
    title: string;
    icon?: string;
    onClick: () => void;
  }>;
  isReturnEnabled?: boolean;
  onClickReturnButton?: () => void;
  isSticky?: boolean;
  WhiteLabeling?: {
    createLogoComponentFn?: (React: any, props: any) => ReactNode;
  };
  PatientInfo?: ReactNode;
  Secondary?: ReactNode;
  UndoRedo?: ReactNode;
  /** Fork: workflow (viewer mode) switcher, right side of the header. */
  Workflow?: ReactNode;
  /** Fork: buttons that open the right-hand panels, right side of the header. */
  Panels?: ReactNode;
}

function Header({
  children,
  menuOptions,
  isReturnEnabled = true,
  onClickReturnButton,
  isSticky = false,
  WhiteLabeling,
  PatientInfo,
  UndoRedo,
  Secondary,
  Workflow,
  Panels,
  ...props
}: HeaderProps): ReactNode {
  const rightSlotRef = useRef<HTMLDivElement | null>(null);
  const centerSlotRef = useRef<HTMLDivElement | null>(null);
  const [rightSlotWidth, setRightSlotWidth] = useState(0);
  const [toolbarStartOffsetPx, setToolbarStartOffsetPx] = useState<number | null>(null);

  const onClickReturn = () => {
    if (isReturnEnabled && onClickReturnButton) {
      onClickReturnButton();
    }
  };

  const appConfig = (window as any)?.config ?? {};
  const productConfig = appConfig.imagingPlatform ?? {};
  const brandConfig = productConfig.brand ?? appConfig.brand ?? {};
  const toolbarConfig = productConfig.toolbar ?? {};
  const fallbackBrandName = brandConfig.appName || 'AxialScope';
  const toolbarLeftGuardPx = Number(
    toolbarConfig.leftGuardPx ?? appConfig.toolbarLeftGuardPx ?? 12
  );
  // Fork: the toolbar starts at the image area's left edge (follows the left panel as it
  // resizes or collapses); `alignToViewport: false` starts it right after the logo instead.
  const alignToolbarToViewport = toolbarConfig.alignToViewport !== false;
  // Fork: a short caption under each toolbar icon; `toolbar.showLabels: false` hides them.
  const showToolbarLabels = toolbarConfig.showLabels !== false;
  const toolbarMinRightActionsPx = Number(
    toolbarConfig.minRightActionsPx ?? appConfig.toolbarMinRightActionsPx ?? 44
  );

  useEffect(() => {
    const element = rightSlotRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const nextWidth = Math.ceil(element.getBoundingClientRect().width || 0);
      setRightSlotWidth(prev =>
        Math.abs(prev - nextWidth) <= MEASUREMENT_TOLERANCE_PX ? prev : nextWidth
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const centerElement = centerSlotRef.current;
    if (!centerElement || !alignToolbarToViewport) {
      return;
    }

    const resolveViewportPanel = () =>
      (document.querySelector(
        '[data-panel-id="viewerLayoutResizableViewportGridPanel"]'
      ) as HTMLElement | null) ||
      (document.getElementById('viewerLayoutResizableViewportGridPanel') as HTMLElement | null);

    const updateOffset = () => {
      const viewportPanel = resolveViewportPanel();
      if (!viewportPanel) {
        return;
      }

      const centerRect = centerElement.getBoundingClientRect();
      const viewportRect = viewportPanel.getBoundingClientRect();
      const offset = Math.max(toolbarLeftGuardPx, Math.ceil(viewportRect.left - centerRect.left));
      setToolbarStartOffsetPx(prev => {
        if (prev === null) {
          return offset;
        }

        return Math.abs(prev - offset) <= MEASUREMENT_TOLERANCE_PX ? prev : offset;
      });
    };

    updateOffset();
    const centerObserver = new ResizeObserver(updateOffset);
    centerObserver.observe(centerElement);

    const viewportPanel = resolveViewportPanel();
    const viewportObserver = new ResizeObserver(updateOffset);
    if (viewportPanel) {
      viewportObserver.observe(viewportPanel);
    }

    window.addEventListener('resize', updateOffset);
    const rafId = requestAnimationFrame(updateOffset);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateOffset);
      centerObserver.disconnect();
      viewportObserver.disconnect();
    };
  }, [toolbarLeftGuardPx, alignToolbarToViewport]);

  return (
    <IconPresentationProvider
      size="large"
      IconContainer={ToolButton}
      showLabels={showToolbarLabels}
    >
      <NavBar
        isSticky={isSticky}
        {...props}
      >
        <div
          className={classNames(
            'flex min-w-0 items-center gap-2',
            showToolbarLabels ? 'h-[52px]' : 'h-[44px]'
          )}
        >
          <div className="ml-0.5 flex min-w-0 shrink items-center">
            <div
              className={classNames(
                'mr-2 inline-flex min-w-0 items-center',
                isReturnEnabled && 'cursor-pointer'
              )}
              onClick={onClickReturn}
              data-cy="return-to-work-list"
            >
              {isReturnEnabled && <Icons.ArrowLeft className="text-primary ml-1 h-7 w-7" />}
              <div className="ml-1 max-w-[150px] truncate sm:max-w-[220px] lg:max-w-[260px]">
                {WhiteLabeling?.createLogoComponentFn?.(React, props) || (
                  // Fork: AxialScope cube before the name when a config sets no logo of its own.
                  <span className="flex min-w-0 items-center gap-2">
                    <img
                      src={`${(window as any).PUBLIC_URL || '/'}assets/favicon-32x32.png`}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded-sm"
                    />
                    <span className="text-foreground block truncate text-lg font-semibold">
                      {fallbackBrandName}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="hidden h-8 items-center xl:flex">{Secondary}</div>
          </div>

          <div
            ref={centerSlotRef}
            className="flex min-w-0 flex-1 items-center justify-start overflow-hidden pr-1"
            style={{
              paddingLeft: `${toolbarStartOffsetPx ?? toolbarLeftGuardPx}px`,
              maxWidth: rightSlotWidth ? `calc(100% - ${rightSlotWidth}px)` : undefined,
            }}
          >
            <div className="flex w-full min-w-0 items-center justify-start space-x-1 overflow-hidden">
              {children}
            </div>
          </div>

          <div
            data-cy="viewer-header-right-slot"
            ref={rightSlotRef}
            className="bg-popover relative z-10 flex shrink-0 select-none items-center"
            style={{ minWidth: `${toolbarMinRightActionsPx}px` }}
          >
            {Panels}
            {Workflow && <div className="flex flex-shrink-0 items-center">{Workflow}</div>}
            <div className="hidden md:flex">{UndoRedo}</div>
            <div className="border-muted mx-1.5 hidden h-[25px] border-r xl:block"></div>
            <div className="hidden min-w-0 max-w-[260px] overflow-hidden xl:flex">
              {PatientInfo}
            </div>
            <div className="border-muted mx-1.5 hidden h-[25px] border-r md:block"></div>
            <div className="flex-shrink-0">
              {/* Fork: with one entry (Settings) the gear opens it directly, no one-item menu. */}
              {menuOptions.length === 0 ? null : menuOptions.length === 1 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground/85 hover:bg-muted h-9 w-9"
                  title={menuOptions[0].title}
                  aria-label={menuOptions[0].title}
                  onClick={menuOptions[0].onClick}
                >
                  <Icons.GearSettings />
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground/85 hover:bg-muted h-9 w-9"
                    >
                      <Icons.GearSettings />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {menuOptions.map((option, index) => {
                      const IconComponent = option.icon
                        ? Icons[option.icon as keyof typeof Icons]
                        : null;
                      return (
                        <DropdownMenuItem
                          key={index}
                          onSelect={option.onClick}
                          className="flex items-center gap-2 py-2"
                        >
                          {IconComponent && (
                            <span className="flex h-4 w-4 items-center justify-center">
                              <Icons.ByName name={option.icon} />
                            </span>
                          )}
                          <span className="flex-1">{option.title}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </NavBar>
    </IconPresentationProvider>
  );
}

export default Header;
