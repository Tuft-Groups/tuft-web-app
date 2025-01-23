export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      new_user?: boolean;
    };
  }
}
