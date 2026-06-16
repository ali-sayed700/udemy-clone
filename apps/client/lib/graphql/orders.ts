export const GET_MY_ORDERS = `
  query MyOrders {
    myOrders {
      _id
      courses {
        _id
        title
        image
        price
      }
      paymentMethod
      paymentId
      totalAmount
      status
      createdAt
    }
  }
`;
