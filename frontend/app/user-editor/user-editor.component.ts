import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { notLegalAgeValidator } from '../validators/not-legal-age-validator.directive';
import { dateValidator } from '../validators/date-validator.directive';
import { camelCaseValidator } from '../validators/camel-case-validator.directive';
import { filterSpaces, maxTwoWordsValidator } from '../validators/max-two-words-validator.directive';
import { onlyLatinValidator } from '../validators/only-latin-validator.directive';
import * as moment from 'moment';
import { integerValidator } from '../validators/integer-validator.directive';
import { User } from '../user-list/user-service.interface';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { UsersState } from '../redux/reducers/user/user.reducer';
import { UpdateCurrentUser } from '../redux/actions/user/user.actions';

@Component({
  selector: 'app-user-editor',
  templateUrl: './user-editor.component.html',
  styleUrls: ['./user-editor.component.scss']
})
export class UserEditorComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  currentUser$!: Observable<User>;

  userForm!: FormGroup;
  currentUserSubscription!: Subscription;

  constructor(
    private fb: FormBuilder,
    private usersStore: Store<UsersState>
  ) {
    this.createForm();
  }

  get form() {
    return this.userForm.controls;
  }

  get name() {
    return this.form.name;
  }

  get age() {
    return this.form.age;
  }

  get birthday() {
    return this.form.birthday;
  }

  get firstLogin() {
    return this.form.firstLogin;
  }

  get nextNotify() {
    return this.form.nextNotify;
  }

  get info() {
    return this.form.info;
  }

  get password() {
    return this.form.password;
  }

  static formatDate(date: string | undefined) {
    return typeof date === 'undefined' || date === '' ? '' : moment(date).format('YYYY/MM/DD');
  }

  ngOnInit() {
    this.currentUserSubscription = this.currentUser$.subscribe((user: User) => {
      this.updateFormValues(user);
    });
  }

  ngAfterViewInit() {
    this.onChanges();
  }

  onChanges(): void {
  }

  createForm() {
    this.userForm = this.fb.group({
      name: ['', {
        validators: [Validators.required],
        asyncValidators: [maxTwoWordsValidator(), camelCaseValidator(), onlyLatinValidator()]
      }],
      age: ['', [integerValidator(), notLegalAgeValidator()]],
      info: [''],
      password: ['', [Validators.required]],
      birthday: ['', dateValidator()],
      firstLogin: ['', dateValidator()],
      nextNotify: ['', dateValidator()]
    });
  }

  updateFormValues(user: User) {
    this.form.name.setValue(user.name);
    this.form.age.setValue(user.age);
    this.form.info.setValue(user.info);
    this.form.birthday.setValue(UserEditorComponent.formatDate(user.birthday));
    this.form.firstLogin.setValue(UserEditorComponent.formatDate(user.firstLogin));
    this.form.nextNotify.setValue(UserEditorComponent.formatDate(user.nextNotify));
    this.form.password.setValue(user.password);
  }

  onSubmit() {
    const params: User = {
      name: filterSpaces(this.name.value).join(' ') as string,
      age: this.age.value as number,
      info: this.info.value as string,
      birthday: this.birthday.value as string,
      firstLogin: this.firstLogin.value as string,
      nextNotify: this.nextNotify.value as string,
      password: this.password.value as string,
    };

    this.usersStore.dispatch(new UpdateCurrentUser(params));
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }
}
