import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CandidateAuthService } from '@services/candidate-auth.service';

import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { CandidateService } from '@services/candidate.service';
import { Candidate } from '@models/candidate';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './candidate-edit.component.html',
})
export class CandidateEditComponent {
  private candidateAuthService = inject(CandidateAuthService);
  private candidateService = inject(CandidateService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  form!: FormGroup;

  candidate!: Candidate;
  candidateId!: string;

  editPersoInfo: boolean = false;
  editShipping: boolean = false;
  editBilling: boolean = false;

  constructor() {
    const candidateSigned = this.candidateService.candidateSig();
    if (candidateSigned) {
      console.log(candidateSigned.candidateUID);
      this.candidateId = candidateSigned.candidateUID;
      this.getOneCandidate();

      // this.candidateId = id
      // // console.log('hay parametro', this.candidateId);
      // this.getcandidate()
    }
  }

  async getOneCandidate() {
    console.log('entromos get One candidate');

    const candidateGetted = await this.candidateService.getThisCandidate(
      this.candidateId
    );
    this.candidate = candidateGetted;
    console.log(this.candidate);

    this.buildForm();
  }


  private buildForm() {
    this.form = this.formBuilder.group({
      firstname: [this.candidate.username, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      lastname: [this.candidate.lastname, [Validators.minLength(1), Validators.maxLength(30)]],
      email: [this.candidate.email, [Validators.required, Validators.email, Validators.maxLength(80)]],
      // phone: [this.candidate.phone, [Validators.minLength(9), Validators.maxLength(15), Validators.pattern("^[0-9]*$")]],
      // birthdate: [this.candidate.birthdate, [Validators.minLength(7)]],
      // optionalText: [this.candidate.optionalText, Validators.maxLength(80)],
      address: [this.candidate.address, Validators.minLength(8)],
      city: [this.candidate.city, [Validators.minLength(2)]],
      // state: [this.candidate.state],
      // zipCode: [this.candidate.zipCode, [Validators.minLength(5), Validators.maxLength(8)]],
      // // country: [this.candidate.country],
    });
  };


  saveUser(event: Event) {
    if (this.form.valid) {
    // console.log(this.form.value);
    this.candidateService.updateOneUser(this.form.value, this.candidateId);
    // this.user = this.form.value;
    // console.log(this.userId);

    this.getOneCandidate(); // very important each time save!!!
    this.editPersoInfo = false;
    this.editShipping = false;
    this.editBilling = false;
    } else {
      this.form.markAllAsTouched();
    };


  };


  get firstnameField() {
    return this.form.get('firstname')
  };
  get lastnameField() {
    return this.form.get('lastname')
  };
  get emailField() {
    return this.form.get('email')
  };
  get phoneField() {
    return this.form.get('phone')
  };
  get birthdateField() {
    return this.form.get('birthdate')
  };
  get byEmailField() {
    return this.form.get('byEmail')
  };
  get byPhoneField() {
    return this.form.get('byPhone')
  };
  get optionalTextField() {
    return this.form.get('optionalText')
  };

  get addressField() {
    return this.form.get('address')
  };
  get addressExtraField() {
    return this.form.get('addressExtra')
  };
  get cityField() {
    return this.form.get('city')
  };
  get stateField() {
    return this.form.get('state')
  };
  get zipCodeField() {
    return this.form.get('zipCode')
  };

  // // get adultField() {
  // //   return this.form.get('adult')
  // // };
  // // get agreeField() {
  // //   return this.form.get('agree')
  // // };

  get billDifThanShipField() {
    return this.form.get('billDifThanShip')
  };

  get xfirstnameField() {
    return this.form.get('xfirstname')
  };
  get xlastnameField() {
    return this.form.get('xlastname')
  };

  get xaddressField() {
    return this.form.get('xaddress')
  };
  get xaddressExtraField() {
    return this.form.get('xaddressExtra')
  };
  get xcityField() {
    return this.form.get('xcity')
  };
  get xstateField() {
    return this.form.get('xstate')
  };
  get xzipCodeField() {
    return this.form.get('xzipCode')
  };




  // FIRST name
  get isfirstnameFieldValid() {
    return this.firstnameField!.touched && this.firstnameField!.valid
  };
  get isfirstnameFieldInvalid() {
    return this.firstnameField!.touched && this.firstnameField!.invalid
  };
  // LAST name
  get islastnameFieldValid() {
    return this.lastnameField!.touched && this.lastnameField!.valid
  };
  get islastnameFieldInvalid() {
    return this.lastnameField!.touched && this.lastnameField!.invalid
  };
  // EMAIL
  get isemailFieldValid() {
    return this.emailField!.touched && this.emailField!.valid
  };
  get isemailFieldInvalid() {
    return this.emailField!.touched && this.emailField!.invalid
  };
  // PHONE
  get isphoneFieldValid() {
    return this.phoneField!.touched && this.phoneField!.valid
  };
  get isphoneFieldInvalid() {
    return this.phoneField!.touched && this.phoneField!.invalid
  };
  // BIRTHDATE
  get isbirthdateFieldValid() {
    return this.birthdateField!.touched && this.birthdateField!.valid
  };
  get isbirthdateFieldInvalid() {
    return this.birthdateField!.touched && this.birthdateField!.invalid
  };
  // BY phone
  get isbyPhoneFieldValid() {
    return this.byPhoneField!.touched && this.byPhoneField!.valid
  };
  get isbyPhoneFieldInvalid() {
    return this.byPhoneField!.touched && this.byPhoneField!.invalid
  };
  // BY email
  get isbyEmailFieldValid() {
    return this.byEmailField!.touched && this.byEmailField!.valid
  };
  get isbyEmailFieldInvalid() {
    return this.byEmailField!.touched && this.byEmailField!.invalid
  };
  // OPTIONAL TEXT
  get isoptionalTextFieldValid() {
    return this.optionalTextField!.touched && this.optionalTextField!.valid
  };
  get isoptionalTextFieldInvalid() {
    return this.optionalTextField!.touched && this.optionalTextField!.invalid
  };


  // ADDRESS
  get isaddressFieldValid() {
    return this.addressField!.touched && this.addressField!.valid
  };
  get isaddressFieldInvalid() {
    return this.addressField!.touched && this.addressField!.invalid
  };
  // ADDRESS Extra
  get isaddressExtraFieldValid() {
    return this.addressExtraField!.touched && this.addressExtraField!.valid
  };
  get isaddressExtraFieldInvalid() {
    return this.addressExtraField!.touched && this.addressExtraField!.invalid
  };
  // CITY
  get iscityFieldValid() {
    return this.cityField!.touched && this.cityField!.valid
  };
  get iscityFieldInvalid() {
    return this.cityField!.touched && this.cityField!.invalid
  };
  // STATE
  get isstateFieldValid() {
    return this.stateField!.touched && this.stateField!.valid
  };
  get isstateFieldInvalid() {
    return this.stateField!.touched && this.stateField!.invalid
  };
  // ZIP CODE
  get iszipCodeFieldValid() {
    return this.zipCodeField!.touched && this.zipCodeField!.valid
  };
  get iszipCodeFieldInvalid() {
    return this.zipCodeField!.touched && this.zipCodeField!.invalid
  };


  // BILL Same as SHIPPING
  get isbillDifThanShipFieldValid() {
    return this.billDifThanShipField!.touched && this.billDifThanShipField!.valid
  };
  get isbillDifThanShipFieldInvalid() {
    return this.billDifThanShipField!.touched && this.billDifThanShipField!.invalid
  };


  // X FIRST name
  get isxfirstnameFieldValid() {
    return this.xfirstnameField!.touched && this.xfirstnameField!.valid
  };
  get isxfirstnameFieldInvalid() {
    return this.xfirstnameField!.touched && this.xfirstnameField!.invalid
  };
  // X LAST name
  get isxlastnameFieldValid() {
    return this.xlastnameField!.touched && this.xlastnameField!.valid
  };
  get isxlastnameFieldInvalid() {
    return this.xlastnameField!.touched && this.xlastnameField!.invalid
  };


  // X ADDRESS
  get isxaddressFieldValid() {
    return this.xaddressField!.touched && this.xaddressField!.valid
  };
  get isxaddressFieldInvalid() {
    return this.xaddressField!.touched && this.xaddressField!.invalid
  };
  // X ADDRESS Extra xaddressExtra
  get isxaddressExtraFieldValid() {
    return this.xaddressExtraField!.touched && this.xaddressExtraField!.valid
  };
  get isxaddressExtraFieldInvalid() {
    return this.xaddressExtraField!.touched && this.xaddressExtraField!.invalid
  };
  // X CITY
  get isxcityFieldValid() {
    return this.xcityField!.touched && this.xcityField!.valid
  };
  get isxcityFieldInvalid() {
    return this.xcityField!.touched && this.xcityField!.invalid
  };
  // X STATE
  get isxstateFieldValid() {
    return this.xstateField!.touched && this.xstateField!.valid
  };
  get isxstateFieldInvalid() {
    return this.xstateField!.touched && this.xstateField!.invalid
  };
  // X ZIP CODE
  get isxzipCodeFieldValid() {
    return this.xzipCodeField!.touched && this.xzipCodeField!.valid
  };
  get isxzipCodeFieldInvalid() {
    return this.xzipCodeField!.touched && this.xzipCodeField!.invalid
  };


  changeEditPersonalInfo() {
    this.editPersoInfo = !this.editPersoInfo;
    this.editShipping = false;
    this.editBilling = false;
    console.log(this.editPersoInfo);
  };

  changeEditShipping() {
    this.editShipping = !this.editShipping;
    this.editPersoInfo = false;
    this.editBilling = false;
    console.log(this.editShipping);
  };

  changeEditBilling() {
    this.editBilling = !this.editBilling;
    this.editShipping = false;
    this.editPersoInfo = false;
    console.log(this.editBilling);
  };

  updateUser() {
    this.candidateService.updateOneUser(this.candidate, this.candidateId);
    this.buildForm();
  }

  // copyfromShipping() {
  //   this.candidate.billDifThanShip = false;
  //   this.candidate.xfirstname = this.candidate.firstname;
  //   this.candidate.xlastname = this.candidate.lastname;
  //   this.candidate.xaddress = this.candidate.address;
  //   this.candidate.xaddressExtra = this.candidate.addressExtra;
  //   this.candidate.xcity = this.candidate.city;
  //   this.candidate.xstate = this.candidate.state;
  //   this.candidate.xzipCode = this.candidate.zipCode;

  //   this.updateUser();
  // };

  // setBillDifShipping() {
  //   this.user.billDifThanShip = true;
  //   this.updateUser();
  // }


  // modalSubscription(value: string) {
  //   if(value == "active") {
  //     alert('We are happy! We will contact you via email to confirm your choice.');
  //     this.clientService.updateOneUserJustOneField('subscription', value, this.userId);
  //     this.user.subscription == value;
  //     this.emailService.sendWildCardEmail(this.user, 'Se RE SUBSCRIBIÓ el cliente', 'Este user clickeo RE SUBSCRIBIRSE');
  //     this.getUser();
  //   }
  //   if(value == "inactive") {
  //     alert('Sorry to see you go! We will contact you via email to confirm.');
  //     this.clientService.updateOneUserJustOneField('subscription', value, this.userId);
  //     this.user.subscription == value;
  //     this.emailService.sendWildCardEmail(this.user, 'UNSUBSCRIBE', 'Este user click en UNSUBSCRIBE');
  //     this.getUser();
  //   }
  // }




}
