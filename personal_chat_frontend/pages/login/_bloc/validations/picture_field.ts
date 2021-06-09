import { FormzInput } from '@tokenyet/react-bloc';
import validator from 'validator';

export enum PictureFieldError {
  empty,
  format,
}

export class PictureField extends FormzInput<string, PictureFieldError> {
  pure() {
    super.pure();
    this.value = '';
  }

  dirty(value: string) {
    super.dirty(value);
  }

  validator(value: string | null): PictureFieldError | null {
    if (value == null || value == '') return PictureFieldError.empty;
    if (!validator.isURL(value)) return PictureFieldError.format;
    return null;
  }
}
