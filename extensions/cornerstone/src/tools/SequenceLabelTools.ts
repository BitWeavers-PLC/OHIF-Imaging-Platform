import { LabelTool, annotation as csAnnotation, drawing, Enums } from '@cornerstonejs/tools';
import { getEnabledElement } from '@cornerstonejs/core';
import { nextSpineLevel, ttTgDistance } from './measureMath';

/**
 * Fork: label tools whose text comes from a sequence instead of a prompt each time (Spine
 * labels, TT-TG points). Each click places the next label; a small marker shows the exact point.
 * `configuration.promptText(callback)` asks the reader when the sequence needs a value.
 */
class SequenceLabelTool extends LabelTool {
  _element: HTMLDivElement | null = null;

  constructor(toolProps = {}) {
    super(toolProps);
    const baseAdd = this.addNewAnnotation;
    this.addNewAnnotation = evt => {
      this._element = evt.detail.element;
      return baseAdd(evt);
    };
    this.configuration.getTextCallback = done => {
      const annotation = this.editData?.annotation;
      this.removeUnlabelled(annotation);
      this.nextLabel(annotation, label => {
        if (label && annotation) {
          annotation.data.text = label;
        }
        done(label);
      });
    };
    const baseRender = this.renderAnnotation;
    this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
      const rendered = baseRender(enabledElement, svgDrawingHelper);
      this.drawMarkers(enabledElement, svgDrawingHelper);
      return rendered;
    };
  }

  /** Drops this tool's labels left empty (a dialog that never completed). */
  removeUnlabelled(current) {
    (csAnnotation.state.getAllAnnotations?.() ?? [])
      .filter(
        other =>
          other !== current && other.metadata?.toolName === this.getToolName() && !other.data?.label
      )
      .forEach(other => csAnnotation.state.removeAnnotation(other.annotationUID));
  }

  /** Earlier labels of this tool in the same frame of reference, oldest first. */
  previousLabels(annotation) {
    const frame = annotation?.metadata?.FrameOfReferenceUID;
    return (csAnnotation.state.getAllAnnotations?.() ?? []).filter(
      other =>
        other !== annotation &&
        other.metadata?.toolName === this.getToolName() &&
        other.metadata?.FrameOfReferenceUID === frame &&
        other.data?.label
    );
  }

  ask(done: (label: string | null) => void) {
    const prompt = this.configuration.promptText;
    if (prompt) {
      prompt(text => done(text?.trim() || null));
    } else {
      done(window.prompt('Label')?.trim() || null);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  nextLabel(annotation, done: (label: string | null) => void) {
    this.ask(done);
  }

  drawMarkers(enabledElement, svgDrawingHelper) {
    const { viewport } = enabledElement;
    const annotations = csAnnotation.state.getAnnotations(this.getToolName(), viewport.element);
    const visible = annotations?.length
      ? this.filterInteractableAnnotationsForElement(viewport.element, annotations)
      : [];
    for (const annotation of visible ?? []) {
      if (!csAnnotation.visibility.isAnnotationVisible(annotation.annotationUID)) {
        continue;
      }
      const { color } = this.getAnnotationStyle({
        annotation,
        styleSpecifier: {
          toolGroupId: this.toolGroupId,
          toolName: this.getToolName(),
          viewportId: viewport.id,
          annotationUID: annotation.annotationUID,
        },
      });
      const point = viewport.worldToCanvas(annotation.data.handles.points[0]);
      drawing.drawHandles(svgDrawingHelper, annotation.annotationUID, 'marker', [point], {
        color,
        handleRadius: 3,
        fill: color,
      });
    }
  }
}

/**
 * Fork: Spine labels. The first label asks for the level (e.g. C3); each further click places
 * the next one down (C4, C5 ... T1 ... L5, S1). Editing a label (double-click) continues the
 * sequence from the new level.
 */
export class SpineLabelTool extends SequenceLabelTool {
  static toolName = 'SpineLabel';

  nextLabel(annotation, done) {
    const previous = this.previousLabels(annotation).at(-1);
    const next = previous && nextSpineLevel(previous.data.label);
    if (next) {
      done(next);
      return;
    }
    this.ask(text => done(text ? text.toUpperCase() : null));
  }
}

const TTTG_STEPS = ['Medial condyle', 'Lateral condyle', 'TG', 'TT'];

/**
 * Fork: TT-TG distance (knee). Click, in order: the medial and the lateral posterior femoral
 * condyle, the deepest point of the trochlear groove (TG), then the tibial tuberosity (TT) on
 * its own slice. The TT label shows the TT-TG distance measured along the posterior condylar
 * line. The next click starts a new set.
 */
export class TTTGTool extends SequenceLabelTool {
  static toolName = 'TTTG';

  constructor(toolProps = {}) {
    super(toolProps);
    const baseRender = this.renderAnnotation;
    // Dragging a point updates the distance.
    this.renderAnnotation = (enabledElement, svgDrawingHelper) => {
      this.updateDistances(enabledElement.viewport);
      return baseRender(enabledElement, svgDrawingHelper);
    };
  }

  nextLabel(annotation, done) {
    const step = this.previousLabels(annotation).length % TTTG_STEPS.length;
    annotation.data.tttgStep = step;
    annotation.data.tttgSet = Math.floor(
      this.previousLabels(annotation).length / TTTG_STEPS.length
    );
    done(TTTG_STEPS[step]);
    if (step === TTTG_STEPS.length - 1 && this._element) {
      this.updateDistances(getEnabledElement(this._element)?.viewport);
    }
  }

  updateDistances(viewport) {
    if (!viewport) {
      return;
    }
    const all = (csAnnotation.state.getAllAnnotations?.() ?? []).filter(
      other => other.metadata?.toolName === this.getToolName() && other.data?.tttgStep != null
    );
    for (const tt of all.filter(a => a.data.tttgStep === TTTG_STEPS.length - 1)) {
      const set = all.filter(
        a =>
          a.data.tttgSet === tt.data.tttgSet &&
          a.metadata?.FrameOfReferenceUID === tt.metadata?.FrameOfReferenceUID
      );
      const point = (step: number) =>
        set.find(a => a.data.tttgStep === step)?.data.handles.points[0];
      const [medial, lateral, groove] = [0, 1, 2].map(point);
      if (!medial || !lateral || !groove) {
        continue;
      }
      const distance = ttTgDistance(
        medial,
        lateral,
        groove,
        tt.data.handles.points[0],
        tt.metadata?.viewPlaneNormal ?? viewport.getCamera().viewPlaneNormal
      );
      const label = distance == null ? 'TT' : `TT · TT-TG ${distance.toFixed(1)} mm`;
      if (tt.data.label !== label) {
        tt.data.label = label;
        tt.data.text = label;
        tt.data.tttgDistance = distance;
        csAnnotation.state.triggerAnnotationModified(
          tt,
          viewport.element,
          Enums.ChangeTypes.StatsUpdated
        );
      }
    }
  }
}
