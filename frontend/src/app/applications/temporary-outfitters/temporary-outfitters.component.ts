import { Component, OnInit } from '@angular/core';
import { Application } from '../../_models/application';
import { ApplicationFieldsService } from '../_services/application-fields.service';
import { ApplicationService } from '../../_services/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-temporary-outfitters',
  templateUrl: './temporary-outfitters.component.html'
})
export class TemporaryOutfittersComponent implements OnInit {

  apiErrors: any;
  application = new Application();
  applicationId: number;
  forest = 'Mt. Baker-Snoqualmie National Forest';
  mode = 'Observable';
  submitted = false;
  uploadFiles = false;
  goodStandingEvidenceMessage: string;
  orgTypeFileUpload: boolean;

  applicationForm: FormGroup;

  constructor(
    private applicationService: ApplicationService,
    private applicationFieldsService: ApplicationFieldsService,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.applicationForm = this.formBuilder.group({
      district: ['11', [Validators.required]],
      region: ['06', [Validators.required]],
      forest: ['05', [Validators.required]],
      type: ['tempOutfitters', [Validators.required]],
      signature: ['', [Validators.required]],
      applicantInfo: this.formBuilder.group({
        emailAddress: ['', Validators.required],
        organizationName: [''],
        primaryFirstName: ['', [Validators.required]],
        primaryLastName: ['', [Validators.required]],
        orgType: ['', [Validators.required]],
        website: ['']
      }),
      tempOutfittersFields: this.formBuilder.group({
        individualIsCitizen: [''],
        smallBusiness: [''],
        advertisingDescription: ['', [Validators.required]],
        advertisingURL: [''],
        clientCharges: ['', [Validators.required]],
        experienceList: ['']
      })

    });

    this.applicationForm.get('applicantInfo.orgType').valueChanges.subscribe(type => {
      switch (type) {
        case 'individual':
          this.goodStandingEvidenceMessage = 'Are you a citizen of the United States?';
          this.orgTypeFileUpload = false;
          break;
        case 'corporation':
          this.goodStandingEvidenceMessage = 'Provide a copy of your state certificate of good standing.';
          this.orgTypeFileUpload = true;
          break;
        case 'llc':
          this.goodStandingEvidenceMessage = 'Provide a copy of your state certificate of good standing.';
          this.orgTypeFileUpload = true;
          break;
        case 'partnership':
          this.goodStandingEvidenceMessage = 'Provide a copy of your partnership or association agreement.';
          this.orgTypeFileUpload = true;
          break;
        case 'stateGovernment':
          this.goodStandingEvidenceMessage = '';
          this.orgTypeFileUpload = false;
          break;
        case 'localGovernment':
          this.goodStandingEvidenceMessage = '';
          this.orgTypeFileUpload = false;
          break;
        case 'nonprofit':
          this.goodStandingEvidenceMessage = 'Please attach a copy of your IRS Form 990';
          this.orgTypeFileUpload = true;
          break;
      }
    });
  }

  onSubmit(form) {
    this.submitted = true;
    if (!form.valid) {
      window.scroll(0, 0);
    } else {
      this.applicationService.create(JSON.stringify(this.applicationForm.value), '/special-uses/temp-outfitters/')
        .subscribe(
          (persistedApplication) => {
            this.applicationId = persistedApplication.applicationId;
            this.uploadFiles = true;
            // TODO post file upload functionality
             this.router.navigate(['applications/submitted/' + persistedApplication.applicationId]);
          },
          (e: any) => {
            this.apiErrors =  e;
            window.scroll(0, 0);
          }
        );
    }
  }

  ngOnInit() {
  }
}