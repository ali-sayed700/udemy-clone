export const queryFav = `
      query MyFavorites {
        myFavorites {
          _id
          course {
            _id
            title
            description
            image
            price
            level
            instructor {
              _id
              userName
            }
          }
          createdAt
        }
      }
    `;

export const GET_MY_FAVORITE_COUNT = `
      query MyFavoriteCount {
        myFavorites {
          _id
        }
      }
    `;

export const IS_FAVORITE_QUERY = `query IsFavorite($courseId: ID!) {
      isFavorite(courseId: $courseId)
    }`;

export const TOGGLE_FAVORITE_MUTATION = `mutation ToggleFavorite($courseId: ID!) {
      toggleFavorite(courseId: $courseId)
    }`;
