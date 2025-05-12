import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-login-elector',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.less']
})
export class MainComponent implements OnInit {
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

  constructor(private fb: UntypedFormBuilder,
              public route: ActivatedRoute,
              public router: Router,
              ){}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    });
      this.url = this.route.snapshot.queryParams["u"] || "/";
  }
}
