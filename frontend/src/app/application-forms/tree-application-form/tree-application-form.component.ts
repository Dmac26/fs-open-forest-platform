import { Title } from '@angular/platform-browser';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { alphanumericValidator } from '../validators/alphanumeric-validation';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { currencyValidator } from '../validators/currency-validation';
import { lessThanOrEqualValidator } from '../validators/less-than-or-equal-validation';
import { ForestService } from '../../trees/_services/forest.service';
import { ApplicationFieldsService } from '../_services/application-fields.service';
import { ChristmasTreesApplicationService } from '../../trees/_services/christmas-trees-application.service';
import { UtilService } from '../../_services/util.service';
import * as moment from 'moment-timezone';
import { MarkdownService } from 'ngx-md';

@Component({
  selector: 'app-tree-application-form',
  templateUrl: './tree-application-form.component.html'
})
export class TreeApplicationFormComponent implements OnInit {
  forest: any;
  permit: any;
  submitted = false;
  application: any;
  applicationForm: FormGroup;
  maxNumberOfTrees: number;
  costPerTree: number;
  apiErrors: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    public formBuilder: FormBuilder,
    public markdownService: MarkdownService,
    public applicationService: ChristmasTreesApplicationService,
    public applicationFieldsService: ApplicationFieldsService,
    private forestService: ForestService,
    public util: UtilService
  ) {}

  quantityChange(value) {
    this.applicationForm
      .get('quantity')
      .setValidators([Validators.required, lessThanOrEqualValidator(this.maxNumberOfTrees, 1)]);
    if (!this.applicationForm.get('quantity').errors) {
      this.updateTotalCost();
    } else {
      this.applicationForm.get('totalCost').setValue(0);
    }
  }

  getApplicationForm(formBuilder, maxNumTrees) {
    return formBuilder.group({
      forestId: ['', [Validators.required]],
      forestAbbr: [''],
      orgStructureCode: ['', [Validators.required]],
      treeCost: [''],
      firstName: ['', [Validators.required, alphanumericValidator(), Validators.maxLength(255)]],
      lastName: ['', [Validators.required, alphanumericValidator(), Validators.maxLength(255)]],
      emailAddress: ['', [Validators.required, Validators.email, alphanumericValidator(), Validators.maxLength(255)]],
      quantity: ['', [Validators.required, Validators.min(1), Validators.max(maxNumTrees)]],
      totalCost: [0, [Validators.required, currencyValidator()]],
      acceptRules: [false, [Validators.required]]
    });
  }

  createForm(data, formBuilder) {
    this.applicationForm = this.getApplicationForm(formBuilder, data.forest.maxNumTrees);

    this.applicationForm.get('forestId').setValue(data.forest.id);
    this.applicationForm.get('forestAbbr').setValue(data.forest.forestAbbr);
    this.applicationForm.get('orgStructureCode').setValue(data.forest.orgStructureCode);
    this.costPerTree = data.forest.treeCost;
    this.applicationForm.get('treeCost').setValue(this.costPerTree);
    this.maxNumberOfTrees = data.forest.maxNumTrees;
    if (this.permit) {
      this.rePopulateForm();
      if (this.permit.status !== 'Cancelled' || this.permit.status !== 'Error') {
        this.applicationService.cancelOldApp(this.permit.permitId).subscribe(cancelResponse => {
          this.permit.status = 'Cancelled';
        });
      }
    }

    this.applicationForm.get('quantity').valueChanges.subscribe(value => {
      this.quantityChange(value);
    });
  }

  checkSeasonStartDate(forest) {
    if (forest && moment(forest.startDate).isAfter(moment().tz(forest.timezone))) {
      this.router.navigate(['/christmas-trees/forests/', forest.forestAbbr]);
    }
  }


  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data.forest) {
        this.forest = data.forest;

        if (this.forest) {
          this.forestService.updateMarkdownText(this.markdownService, this.forest);
        }

        this.checkSeasonStartDate(this.forest);
        this.permit = data.permit;
        this.titleService.setTitle(
          'Buy a permit | ' + this.forest.forestName + ' | U.S. Forest Service Christmas Tree Permitting'
        );
        this.createForm(data, this.formBuilder);

      }
    });
  }

  onSubmit() {
    this.submitted = true;
    this.apiErrors = null;
    this.applicationFieldsService.touchAllFields(this.applicationForm);
    if (this.applicationForm.valid) {
      this.createApplication();
    } else {
      this.applicationFieldsService.scrollToFirstError();
    }
  }

  rePopulateForm() {
    this.applicationForm.get('firstName').setValue(this.permit.firstName);
    this.applicationForm.get('lastName').setValue(this.permit.lastName);
    this.applicationForm.get('emailAddress').setValue(this.permit.emailAddress);
    this.applicationForm.get('quantity').setValue(this.permit.quantity);
    this.applicationForm.get('acceptRules').setValue(false);
    this.quantityChange(this.permit.quantity);
  }

  createApplication() {
    this.applicationService.create(JSON.stringify(this.applicationForm.value)).subscribe(
      response => {
        window.location.href = `${response.payGovUrl}?token=${response.token}&tcsAppID=${response.tcsAppID}`;
      },
      (error: any) => {
        this.apiErrors = error;
        this.submitted = false;
        this.applicationForm.get('acceptRules').setValue(false);
        window.scroll(0, 0);
      }
    );
  }

  goToRules(event) {
    this.util.gotoHashtag('rules', event);
  }

  updateTotalCost() {
    const quantity = this.applicationForm.get('quantity').value;
    if (!isNaN(parseInt(quantity, 10))) {
      this.applicationForm.get('totalCost').setValue(parseInt(quantity, 10) * this.costPerTree);
    } else {
      this.applicationForm.get('totalCost').setValue(0);
    }
  }
}