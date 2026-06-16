export const queryEnroll = `query MyEnrollments {
        myEnrollments {
          _id
          course {
            _id
            title
            image
            description
            instructor {
              _id
              userName
            }
            lectures {
              _id
            }
          }
          paymentMethod
          amount
          enrolledAt
        }
      }`;

export const IS_ENROLLED_QUERY = `query IsEnrolled($courseId: ID!) {
          isEnrolled(courseId: $courseId) {
            enrolled
          }
        }`;
