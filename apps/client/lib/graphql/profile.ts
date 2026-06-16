export const GET_USER_QUERY = `
  query getUser($id: ID!) {
    user(id: $id) {
      _id
      email
      userName
      avatar
      role
      createdAt
    }
  }
`;

export const UPDATE_USER_MUTATION = `
  mutation updateUser($updateUserInput: UpdateUserInput!) {
    updateUser(updateUserInput: $updateUserInput) {
      _id
      email
      userName
      avatar
      role
    }
  }
`;
