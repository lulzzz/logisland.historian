import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';

import { QuestionBase } from '../question-base';
import { QuestionControlService } from '../question-control.service';

@Component({
  selector: 'app-question',
  templateUrl: './dynamic-form-question.component.html'
})
export class DynamicFormQuestionComponent implements OnInit {

  @Input() question: QuestionBase<any>;
  @Input() form: FormGroup;

  constructor(private fb: FormBuilder,
    private qcs: QuestionControlService) { }

  ngOnInit(): void { }

  get isValid(): boolean {
    return this.control.disabled || this.control.valid;
  }

  get control(): AbstractControl {
    return this.form.controls[this.question.key];
  }
}
