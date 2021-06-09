import React, { useContext } from 'react';
import { Button, TextField } from '@material-ui/core';
import CenterPaper from '../../src/components/scaffold/center_paper';
import Scaffold from '../../src/components/scaffold/scaffold';
import { useSpring, animated } from 'react-spring';
import { FormzStatus, RepoContext, useBloc } from '@tokenyet/react-bloc';
import {
  ChangeNameEvent,
  ChangePasswordEvent,
  ChangePictureEvent,
  FormValdiationState,
  FormValidationBloc,
  FormValidationEvent,
} from './_bloc/form_validation_bloc';
import {
  LoginActionBloc,
  LoginActionEvent,
  LoginActionState,
} from './_bloc/login_bloc';
import UserRepository from '../../src/repositories/user_repository';
import { NameFieldError } from './_bloc/validations/name_field';
import { PasswordFieldError } from './_bloc/validations/password_field';
import { PictureFieldError } from './_bloc/validations/picture_field';
import { useRouter } from 'next/router';

enum _PageState {
  login,
  signup,
}

export default function LoginPage() {
  const [pageState, setPageState] = React.useState(_PageState.login);

  const onPageChanged = (state: _PageState) => () => {
    setPageState(state);
  };

  return (
    <Scaffold style={{ backgroundColor: 'coral' }}>
      {pageState === _PageState.signup ? (
        <SignupSubPage onPageChanged={onPageChanged(_PageState.login)} />
      ) : (
        <LoginSubPage onPageChanged={onPageChanged(_PageState.signup)} />
      )}
    </Scaffold>
  );
}

interface _PageChangedProps {
  onPageChanged: () => void;
}

function SignupSubPage({ onPageChanged }: _PageChangedProps) {
  // Data fetching
  const router = useRouter();
  const repoContext = useContext(RepoContext);
  const userRepo = repoContext.of<UserRepository>(UserRepository);
  const [signupAcitonState, signupActionBloc] = useBloc<
    LoginActionBloc,
    LoginActionState,
    LoginActionEvent
  >(
    new LoginActionBloc(async ({ name, password, picture }) => {
      await userRepo?.signup({ name, password, picture });

      return {
        value: null,
      };
    })
  );

  React.useEffect(() => {
    if (signupAcitonState.status === FormzStatus.submissionSuccess) {
      router.push('/chat');
    }
  }, [signupAcitonState.status]);

  // Form validation
  const [formState, formBloc] = useBloc<
    FormValidationBloc,
    FormValdiationState,
    FormValidationEvent
  >(new FormValidationBloc(false));

  const [name, setName] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (name == null) return;
    formBloc.add(new ChangeNameEvent({ name: name }));
  }, [name]);
  const nameError = formState.nameField.checkError();

  const [password, setPassword] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (password == null) return;
    formBloc.add(new ChangePasswordEvent({ password: password }));
  }, [password]);
  const passwordError = formState.passwordField.checkError();

  const [picture, setPicture] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (picture == null) return;
    formBloc.add(new ChangePictureEvent({ pictureUrl: picture }));
  }, [picture]);
  const pictureError = formState.pictureField.checkError();

  // Animation
  const [styles, api] = useSpring(() => ({
    delay: 2000,
    from: { opacity: 0 },
  }));

  React.useEffect(() => {
    api.start({ opacity: 1 });
  }, []);

  return (
    <animated.div style={styles}>
      <CenterPaper elevation={16}>
        <TextField
          placeholder={'Username'}
          onChange={(e) => {
            setName(e.target.value);
          }}
          error={nameError != null}
          helperText={
            nameError === NameFieldError.empty ? 'Cannot be empty' : null
          }
        />
        <TextField
          placeholder={'Password'}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type={'password'}
          error={passwordError != null}
          helperText={
            passwordError === PasswordFieldError.empty
              ? 'Cannot be empty'
              : passwordError === PasswordFieldError.short
              ? 'Should be at least 8 words.'
              : null
          }
        />
        <TextField
          placeholder={'Picture(Url)'}
          onChange={(e) => {
            setPicture(e.target.value);
          }}
          error={pictureError != null}
          helperText={
            pictureError === PictureFieldError.empty
              ? 'Cannot be empty'
              : pictureError === PictureFieldError.format
              ? 'Should be a valid url'
              : null
          }
        />
        <Button
          fullWidth
          variant={'contained'}
          disabled={
            formState.validation !== FormzStatus.valid ||
            signupAcitonState.status === FormzStatus.submissionInProgress
          }
          onClick={() =>
            signupActionBloc.add(
              new LoginActionEvent({
                props: {
                  name: formState.nameField.value!,
                  password: formState.passwordField.value!,
                  picture: formState.pictureField.value!,
                },
              })
            )
          }
        >
          {'Signup'}
        </Button>
        <Button
          variant={'text'}
          size={'small'}
          color={'secondary'}
          onClick={onPageChanged}
        >
          {'Go to login'}
        </Button>
      </CenterPaper>
    </animated.div>
  );
}

function LoginSubPage({ onPageChanged }: _PageChangedProps) {
  // Data fetching
  const router = useRouter();
  const repoContext = useContext(RepoContext);
  const userRepo = repoContext.of<UserRepository>(UserRepository);
  const [signupAcitonState, signupActionBloc] = useBloc<
    LoginActionBloc,
    LoginActionState,
    LoginActionEvent
  >(
    new LoginActionBloc(async ({ name, password }) => {
      await userRepo?.login({ name, password });

      return {
        value: null,
      };
    })
  );

  React.useEffect(() => {
    if (signupAcitonState.status === FormzStatus.submissionSuccess) {
      router.push('/chat');
    }
  }, [signupAcitonState.status]);

  // Form validation
  const [formState, formBloc] = useBloc<
    FormValidationBloc,
    FormValdiationState,
    FormValidationEvent
  >(new FormValidationBloc(true));

  const [name, setName] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (name == null) return;
    formBloc.add(new ChangeNameEvent({ name: name }));
  }, [name]);
  const nameError = formState.nameField.checkError();

  const [password, setPassword] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (password == null) return;
    formBloc.add(new ChangePasswordEvent({ password: password }));
  }, [password]);
  const passwordError = formState.passwordField.checkError();

  // Animation
  const [styles, api] = useSpring(() => ({
    delay: 2000,
    from: { opacity: 0 },
  }));

  React.useEffect(() => {
    api.start({ opacity: 1 });
  }, []);

  return (
    <animated.div style={styles}>
      <CenterPaper elevation={16}>
        <TextField
          placeholder={'Username'}
          onChange={(e) => {
            setName(e.target.value);
          }}
          error={nameError != null}
          helperText={
            nameError === NameFieldError.empty ? 'Cannot be empty' : null
          }
        />
        <TextField
          placeholder={'Password'}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type={'password'}
          error={passwordError != null}
          helperText={
            passwordError === PasswordFieldError.empty
              ? 'Cannot be empty'
              : passwordError === PasswordFieldError.short
              ? 'Should be at least 8 words.'
              : null
          }
        />
        <Button
          fullWidth
          variant={'contained'}
          disabled={
            formState.validation !== FormzStatus.valid ||
            signupAcitonState.status === FormzStatus.submissionInProgress
          }
          onClick={() =>
            signupActionBloc.add(
              new LoginActionEvent({
                props: {
                  name: formState.nameField.value!,
                  password: formState.passwordField.value!,
                  picture: formState.pictureField.value!,
                },
              })
            )
          }
        >
          {'Login'}
        </Button>
        <Button
          variant={'text'}
          size={'small'}
          color={'secondary'}
          onClick={onPageChanged}
        >
          {'Go to signup'}
        </Button>
      </CenterPaper>
    </animated.div>
  );
}
