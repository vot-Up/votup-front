import { Injectable } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { ResponsiveModalConfig } from './responsive-modal-config';

@Injectable({ providedIn: 'root' })
export class ResponsiveModalService {
    constructor(
        private readonly modal: NzModalService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {}

    create(config: ResponsiveModalConfig): NzModalRef {
        const isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
        const shouldFullscreen = config.mobileFullScreen ?? true;

        return this.modal.create({
            ...config,
            nzCentered: isMobile && shouldFullscreen ? false : (config.nzCentered ?? true),
            nzWidth: isMobile && shouldFullscreen ? '100%' : (config.nzWidth ?? '80%'),
            nzStyle: {
                ...(config.nzStyle || {}),
                ...(isMobile && shouldFullscreen ? { top: '0' } : {}),
            },
            nzBodyStyle: {
                ...(config.nzBodyStyle || {}),
                ...(isMobile && shouldFullscreen ? { padding: '0', borderRadius: '0' } : {}),
            },
            nzClosable: config.nzClosable ?? true,
        });
    }

    confirm(config: ResponsiveModalConfig): NzModalRef {
        return this.modal.confirm({
            ...config,
            nzCentered: true,
            nzWidth: config.nzWidth ?? '520px',
        });
    }
}
