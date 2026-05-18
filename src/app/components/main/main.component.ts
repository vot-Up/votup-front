import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import {Router} from "@angular/router";
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less'],
  imports: [NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective]
})
export class MainComponent {
  router = inject(Router);

  goToCreateVote(): void {
    this.router.navigate(['login']).then();
  }

  goToLoginElector(): void {
    this.router.navigate(['login-elector']).then();
  }

  goToRegister(): void {
    this.router.navigate(['register']).then();
  }
}
