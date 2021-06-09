import { FormzInput } from '@tokenyet/react-bloc';

export enum NameFieldError {
  empty,
}

export class NameField extends FormzInput<string, NameFieldError> {
  pure() {
    super.pure();
    this.value = '';
  }

  dirty(value: string) {
    super.dirty(value);
  }

  validator(value: string | null): NameFieldError | null {
    if (value == null || value == '') return NameFieldError.empty;
    return null;
  }
}
