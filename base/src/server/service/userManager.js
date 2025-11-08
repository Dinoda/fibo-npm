import { UserManager } from 'fibo-user';
import JWTAuthenticator from 'fibo-user-jwt';

const userManager = new UserManager(
  /* Source */,
  new JWTAuthenticator(),
  /* Authorizer */
);

export userManager;
