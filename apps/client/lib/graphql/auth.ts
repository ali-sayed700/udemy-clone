import gql from "graphql-tag";

export const CREATE_USER_MUTATION = gql`
  mutation Signup($createUserInput: CreateUserInput!) {
    Signup(createUserInput: $createUserInput) {
      _id
    }
  }
`;

export const SIGN_IN_MUTATION = gql`
  mutation signIn($input: SignInValid!) {
    signIn(input: $input) {
      userId
      userName
      accessToken
      refreshToken
      role
      avatar
    }
  }
`;
