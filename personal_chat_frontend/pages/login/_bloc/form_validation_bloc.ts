import { Bloc, NextFunction, Transition } from '@tokenyet/bloc';
import { NonFunctionProperties } from 'utility-types/dist/mapped-types';
import { NameField } from './validations/name_field';
import { Observable, merge } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { PasswordField } from './validations/password_field';
import { PictureField } from './validations/picture_field';
import { FormValidatorFilter, Formz, FormzStatus } from '@tokenyet/react-bloc';

export abstract class FormValidationEvent {}

export class ChangeNameEvent {
  name!: string;
  constructor(data: NonFunctionProperties<ChangeNameEvent>) {
    Object.assign(this, data);
  }
}

export class ChangePasswordEvent {
  password!: string;
  constructor(data: NonFunctionProperties<ChangePasswordEvent>) {
    Object.assign(this, data);
  }
}

export class ChangePictureEvent {
  pictureUrl!: string;
  constructor(data: NonFunctionProperties<ChangePictureEvent>) {
    Object.assign(this, data);
  }
}

export class FormValdiationState {
  public nameField!: NameField;
  public passwordField!: PasswordField;
  public pictureField!: PictureField;
  public validation!: FormzStatus;

  constructor(data: NonFunctionProperties<FormValdiationState>) {
    Object.assign(this, data);
  }

  copyWith(data: Partial<NonFunctionProperties<FormValdiationState>>) {
    return new FormValdiationState({
      nameField: data.nameField ?? this.nameField,
      passwordField: data.passwordField ?? this.passwordField,
      pictureField: data.pictureField ?? this.pictureField,
      validation: data.validation ?? this.validation,
    });
  }
}

export class FormValidationBloc extends Bloc<
  FormValidationEvent,
  FormValdiationState
> {
  private isIgnorePicture: boolean;
  constructor(isIgnorePicture: boolean) {
    super(
      new FormValdiationState({
        nameField: new NameField({ isPure: true }),
        passwordField: new PasswordField({ isPure: true }),
        pictureField: new PictureField({ isPure: true }),
        validation: FormzStatus.pure,
      })
    );
    this.isIgnorePicture = isIgnorePicture;
  }

  transformEvents(
    events: Observable<FormValidationEvent>,
    next: NextFunction<FormValidationEvent, FormValdiationState>
  ): Observable<Transition<FormValidationEvent, FormValdiationState>> {
    const nameStream = events.pipe(
      filter((e) => e instanceof ChangeNameEvent),
      debounceTime(700)
    );
    const pictureStream = events.pipe(
      filter((e) => e instanceof ChangePictureEvent),
      debounceTime(700)
    );
    const passwordStream = events.pipe(
      filter((e) => e instanceof ChangePasswordEvent),
      debounceTime(700)
    );
    return super.transformEvents(
      merge(nameStream, pictureStream, passwordStream),
      next
    );
  }

  async *mapEventToState(
    event: FormValidationEvent
  ): AsyncIterableIterator<FormValdiationState> {
    const currentState = this.state;
    if (event instanceof ChangeNameEvent) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nameField, pictureField, ...fields } = currentState;
      const newNameField = new NameField({ isPure: false, value: event.name });

      // eslint-disable-next-line new-cap
      let validFields = FormValidatorFilter({ ...fields, pictureField });
      // eslint-disable-next-line new-cap
      if (this.isIgnorePicture) validFields = FormValidatorFilter(fields);

      const validation = Formz.validate([...validFields, newNameField]);

      yield currentState.copyWith({
        nameField: newNameField,
        validation: validation,
      });
    } else if (event instanceof ChangePasswordEvent) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordField, pictureField, ...fields } = currentState;
      const newPasswordField = new PasswordField({
        isPure: false,
        value: event.password,
      });

      // eslint-disable-next-line new-cap
      let validFields = FormValidatorFilter({ ...fields, pictureField });
      // eslint-disable-next-line new-cap
      if (this.isIgnorePicture) validFields = FormValidatorFilter(fields);

      const validation = Formz.validate([...validFields, newPasswordField]);

      yield currentState.copyWith({
        passwordField: newPasswordField,
        validation: validation,
      });
    } else if (event instanceof ChangePictureEvent) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { pictureField, ...fields } = currentState;
      const newPictureField = new PictureField({
        isPure: false,
        value: event.pictureUrl,
      });

      const validation = Formz.validate([
        // eslint-disable-next-line new-cap
        ...FormValidatorFilter(fields),
        newPictureField,
      ]);

      yield currentState.copyWith({
        pictureField: newPictureField,
        validation: validation,
      });
    }
  }
}
