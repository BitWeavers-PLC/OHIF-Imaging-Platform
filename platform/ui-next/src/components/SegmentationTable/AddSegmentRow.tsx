import React from 'react';
import { Button } from '@ohif/ui-next';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { useSegmentationTableContext, useSegmentationExpanded } from './contexts';
import { useTranslation } from 'react-i18next';

export const AddSegmentRow: React.FC<{ children?: React.ReactNode }> = ({ children = null }) => {
  const { t } = useTranslation('SegmentationPanel');
  const {
    activeRepresentation,
    disableEditing,
    activeSegmentationId,
    onSegmentAdd,
    onToggleSegmentationRepresentationVisibility,
    data,
    showAddSegment,
  } = useSegmentationTableContext('AddSegmentRow');

  // Try to get from expanded context first, then fall back to active segmentation
  let segmentationId = activeSegmentationId;
  let representation = activeRepresentation;

  try {
    const expandedContext = useSegmentationExpanded('AddSegmentRow');
    if (expandedContext.isActive) {
      segmentationId = expandedContext.segmentation.segmentationId;
      representation = expandedContext.representation;
    }
  } catch (e) {
    // Use the default values from table context
  }

  // If no segmentations, don't render
  if (!data?.length) {
    return null;
  }

  // Check if all segments are visible
  const allSegmentsVisible = Object.values(representation?.segments || {}).every(
    segment => segment?.visible !== false
  );

  // Fork: the eye shows the current state (open = visible), as in most PACS viewers.
  const Icon = allSegmentsVisible ? (
    <Eye
      className="h-4 w-4"
      strokeWidth={1.5}
    />
  ) : (
    <EyeOff
      className="h-4 w-4"
      strokeWidth={1.5}
    />
  );

  const allowAddSegment = showAddSegment && !disableEditing;

  return (
    <div className="border-border flex h-7 w-full items-center justify-between border-b pl-1 pr-7">
      <div className="flex-1">
        {allowAddSegment ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground h-6 gap-1 px-1 text-xs hover:bg-transparent"
            onClick={() => onSegmentAdd(segmentationId)}
          >
            <Plus
              className="h-3.5 w-3.5"
              strokeWidth={1.5}
            />
            {t('Add Segment')}
          </Button>
        ) : null}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground h-6 w-6"
        onClick={() =>
          onToggleSegmentationRepresentationVisibility(segmentationId, representation?.type)
        }
      >
        {Icon}
      </Button>
      {children}
    </div>
  );
};
