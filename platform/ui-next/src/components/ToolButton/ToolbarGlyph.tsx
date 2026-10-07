import React from 'react';
import { Icons } from '../Icons';
import { useIconPresentation } from '../../contextProviders/IconPresentationProvider';

/** Fork: size of a header button that has a caption under its icon. */
export const captionedButtonClass = 'relative h-[46px] w-[52px] flex-col gap-1 px-0.5';

/**
 * Fork: a toolbar icon, with its short caption underneath when the header shows labels, and a
 * small corner mark on buttons that open a menu.
 */
export function ToolbarGlyph({
  icon,
  caption,
  iconClassName,
  hasMenu = false,
}: {
  icon: string;
  caption?: string;
  iconClassName?: string;
  hasMenu?: boolean;
}) {
  const { showLabels } = useIconPresentation();
  if (!showLabels || !caption) {
    return (
      <Icons.ByName
        name={icon}
        className={iconClassName}
      />
    );
  }
  return (
    <>
      <Icons.ByName
        name={icon}
        className="h-[22px] w-[22px] shrink-0"
      />
      <span className="w-full truncate text-center text-[10px] font-normal leading-none">
        {caption}
      </span>
      {hasMenu && (
        <span
          aria-hidden
          className="border-b-primary absolute right-[3px] top-[22px] h-0 w-0 border-b-[5px] border-l-[5px] border-l-transparent"
        />
      )}
    </>
  );
}

/** Fork: whether the surrounding toolbar shows captions. */
export const useToolbarLabels = () => useIconPresentation().showLabels;
