import { Component, OnInit, inject } from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";
import { NzRowDirective, NzColDirective } from 'ng-zorro-antd/grid';
import { NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactItemDirective } from 'ng-zorro-antd/space';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzWaveDirective } from 'ng-zorro-antd/core/wave';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
    selector: 'app-login-elector',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.less'],
    imports: [NzRowDirective, NzColDirective, NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactItemDirective, NzButtonComponent, NzWaveDirective, ɵNzTransitionPatchDirective]
})
export class MainComponent implements OnInit {
  private fb = inject(UntypedFormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);

  validateForm!: UntypedFormGroup;
    public url: string;

  submitForm(): void {
      if (!this.validateForm.valid) {
          Object.values(this.validateForm.controls).forEach(control => {
              if (control.invalid) {
                  control.markAsDirty();
                  control.updateValueAndValidity({onlySelf: true});
              }
          });
      }
  }

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
      this.url = this.route.snapshot.queryParams["u"] || "/";
  }
}
