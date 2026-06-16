export const GET_MY_CART = `
      query MyCart {
        myCart {
          _id
          items {
            _id
            title
            price
            image
            instructor {
              _id
              userName
            }
          }
        }
      }
    `;

export const GET_MY_CART_COUNT = `
      query MyCartCount {
        myCart {
          items {
            _id
          }
        }
      }
    `;

export const REMOVE_FROM_CART_MUTATION = `
      mutation RemoveFromCart($courseId: ID!) {
        removeFromCart(courseId: $courseId) {
          _id
          items {
            _id
            title
            price
            image
            instructor {
              _id
              userName
            }
          }
        }
      }
    `;

export const ADD_TO_CART_MUTATION = `
      mutation AddToCart($courseId: ID!) {
        addToCart(courseId: $courseId) {
          _id
          items {
            _id
            title
            price
            image
            instructor {
              _id
              userName
            }
          }
        }
      }
    `;
