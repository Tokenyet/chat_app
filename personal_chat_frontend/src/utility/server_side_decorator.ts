import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { User } from '../data/user';
import { useCookie } from 'next-cookie';
import UserRepository from '../repositories/user_repository';

export abstract class ServerSideBase<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
> {
  context: GetServerSidePropsContext<Q>;
  constructor(context: GetServerSidePropsContext<Q>) {
    this.context = context;
  }

  abstract process(): Promise<GetServerSidePropsResult<P>>;
}

export type AuthProps = { user: User };

export class AuthServerProcessor extends ServerSideBase<AuthProps> {
  constructor(context: GetServerSidePropsContext) {
    super(context);
  }

  async process(): Promise<GetServerSidePropsResult<AuthProps>> {
    const userRepo = new UserRepository();
    const token = useCookie(this.context).get<string>('TOKEN');
    let user: User | null = null;
    try {
      user = await userRepo.getMe(token ?? undefined);
    } catch (err) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    if (token == null || user == null) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    return {
      props: {
        user,
      },
    };
  }
}
