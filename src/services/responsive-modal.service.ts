import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { Observable, map } from 'rxjs';

/**
 * Configuration interface for ResponsiveModalService.create().
 * Extends NzModalService options with a mobileFullScreen toggle.
 */
export interface ResponsiveModalConfig {
  /** Modal title */
  nzTitle?: string;
  /** Content component */
  nzContent?: any;
  /** Data to pass to the content component via nzData */
  nzData?: Record<string, any>;
  /** Width for desktop mode. Default: '80%' */
  nzWidth?: string;
  /** EventEmitter or subject for afterClose */
  nzAfterClose?: any;
  /** Whether to render as full-screen sheet on mobile. Default: true */
  mobileFullScreen?: boolean;
  /** Any additional NzModalService.create() options */
  [key: string]: any;
}

/**
 * ResponsiveModalService wraps NzModalService with breakpoint-aware config.
 * - Mobile (<768px): full-screen sheet (nzWidth: 100%, no padding, no border-radius)
 * - Desktop (≥768px): centered modal with configurable width
 * - Confirm dialogs always render as centered dialogs (never full-screen)
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveModalService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly modalService = inject(NzModalService);

  /** Observable that emits true when viewport is mobile (<768px) */
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, '(max-width: 767px)'])
    .pipe(map(state => state.matches));

  /**
   * Check if the current viewport is mobile (synchronous snapshot).
   * Useful for template rendering decisions.
   */
  isMobile(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }

  /**
   * Create a responsive modal. On mobile, renders as full-screen sheet.
   * On desktop, renders as centered modal.
   *
   * @param config - Modal configuration. mobileFullScreen defaults to true.
   * @returns NzModalRef
   */
  create(config: ResponsiveModalConfig): NzModalRef {
    const { mobileFullScreen = true, ...nzOptions } = config;

    if (mobileFullScreen && this.isMobile()) {
      return this.modalService.create({
        ...nzOptions,
        nzWidth: '100%',
        nzCentered: false,
        nzStyle: {
          top: '0',
          padding: '0',
          maxHeight: '100vh',
          borderRadius: '0',
          ...(nzOptions.nzStyle || {}),
        },
        nzBodyStyle: {
          padding: '16px',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 55px)',
          ...(nzOptions.nzBodyStyle || {}),
        },
        nzMask: false,
      });
    }

    // Desktop mode: centered modal
    return this.modalService.create({
      nzWidth: '80%',
      nzCentered: true,
      ...nzOptions,
    });
  }

  /**
   * Create a confirm dialog. Always renders as centered dialog
   * on all breakpoints — never full-screen.
   *
   * @param config - NzModalService.confirm() options
   * @returns NzModalRef
   */
  createConfirm(config: Record<string, any>): NzModalRef {
    return this.modalService.confirm({
      nzOkText: 'Sim',
      nzCancelText: 'Não',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCentered: true,
      ...config,
    });
  }
}
