import { ActionBloc, ActionEvent, ActionState } from '@tokenyet/react-bloc';

export interface LoginProps {
  name: string;
  picture: string;
  password: string;
}

export class LoginActionBloc extends ActionBloc<LoginProps, null> {}
export class LoginActionEvent extends ActionEvent<LoginProps> {}
export class LoginActionState extends ActionState<null> {}
