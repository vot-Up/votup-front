import { Injectable, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ModalOptions, NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Observable, map } from 'rxjs';

/**
 * Configuration for ResponsiveModalService.create().
 * Extends NzModalService options with a mobileFullScreen toggle.
 */
export interface ResponsiveModalConfig<T = unknown, D = unknown> extends ModalOptions<T, D> {
  /** Whether to render as full-screen sheet on mobile. Default: true */
  mobileFullScreen?: boolean;
}

/**
 * ResponsiveModalService wraps NzModalService with breakpoint-aware config.
 * - Mobile (<768px): full-screen sheet
 * - Desktop (≥768px): centered modal
 * - Confirm dialogs always render centered
 */
@Injectable({ providedIn: 'root' })
export class ResponsiveModalService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly modalService = inject(NzModalService);

  /** Observable that emits true when viewport is mobile (<768px). */
  readonly isMobile$: Observable<boolean> = this.breakpointObserver
    .observe([Breakpoints.Handset, '(max-width: 767px)'])
    .pipe(map(state => state.matches));

  /** Synchronous mobile breakpoint snapshot for template decisions. */
  isMobile(): boolean {
    return this.breakpointObserver.isMatched('(max-width: 767px)');
  }

  /**
   * Create a responsive modal. mobileFullScreen defaults to true.
   * nzData and nzAfterClose are forwarded untouched to NzModalService.
   */
  create<T = unknown, D = unknown>(config: ResponsiveModalConfig<T, D>): NzModalRef<T, D> {
    const { mobileFullScreen = true, ...nzOptions } = config;

    if (mobileFullScreen && this.isMobile()) {
      return this.modalService.create<T, D>({
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

    return this.modalService.create<T, D>({
      nzWidth: '80%',
      nzCentered: true,
      ...nzOptions,
    });
  }

  /** Create a confirm dialog that never becomes full-screen. */
  createConfirm<T = unknown>(config: ModalOptions<T>): NzModalRef<T> {
    return this.modalService.confirm<T>({
      nzOkText: 'Sim',
      nzCancelText: 'Não',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCentered: true,
      nzZIndex: 2000,
      nzMaskClosable: false,
      ...config,
    });
  }
}
