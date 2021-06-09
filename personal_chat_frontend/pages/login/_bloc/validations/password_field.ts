import { FormzInput } from '@tokenyet/react-bloc';

export enum PasswordFieldError {
  empty,
  short,
}

export class PasswordField extends FormzInput<string, PasswordFieldError> {
  pure() {
    super.pure();
    this.value = '';
  }

  dirty(value: string) {
    super.dirty(value);
  }

  validator(value: string | null): PasswordFieldError | null {
    if (value == null || value == '') return PasswordFieldError.empty;
    if (value.length < 8) return PasswordFieldError.short;
    return null;
  }
}
