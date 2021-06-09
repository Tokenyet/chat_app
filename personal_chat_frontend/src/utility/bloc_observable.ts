import { Bloc, BlocObserver, Transition } from '@tokenyet/bloc';

export class DebugBlocObserver extends BlocObserver {
  onEvent(_: Bloc<any, any>, event: any): void {
    console.log(event);
  }

  onTransition(_: Bloc<any, any>, transition: Transition<any, any>): void {
    console.log(transition);
  }

  onError(_: Bloc<any, any>, error: any): void {
    console.log(error);
  }
}
