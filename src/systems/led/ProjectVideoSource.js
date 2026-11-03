/**
 * ProjectVideoSource.js — Handles built-in project bundled video assets via assetUrl()
 */
import { NativeVideoSource } from './NativeVideoSource';
import { LED_MEDIA_TYPES } from './LEDConstants';
import { assetUrl } from '../../utils/assetUrl';

export class ProjectVideoSource extends NativeVideoSource {
  constructor(screenId) {
    super(screenId, LED_MEDIA_TYPES.PROJECT_VIDEO);
    this.projectId = '';
  }

  async load(itemOrPath, options = {}) {
    let path = '';
    let label = '';
    if (typeof itemOrPath === 'string') {
      path = itemOrPath;
      label = itemOrPath.split('/').pop();
    } else if (itemOrPath && itemOrPath.source) {
      path = itemOrPath.source;
      label = itemOrPath.label || itemOrPath.id;
      this.projectId = itemOrPath.id;
    }

    const resolvedUrl = assetUrl(path);
    return super.load(resolvedUrl, {
      ...options,
      fileName: label,
      isLocalBlob: false
    });
  }
}
