export const DASHBOARD_COURSES_QUERY = `
  query getCoursesByInstructor {
    coursesByInstructor {
      _id
      title
      description
      price
      image
      categories
      level
      primaryLanguage
      isPublished
      objectives
      welcomeMessage
      studentCount
      students { _id userName }
      lectures {
        _id
        title
        duration
        freePreview
      }
      createdAt
      updatedAt
    }
  }
`;

export const DASHBOARD_ORDERS_QUERY = `
  query getDashboardOrders {
    dashboardOrders {
      _id
      user {
        _id
        userName
        email
      }
      courses {
        _id
        title
        image
        price
        instructor {
          _id
          userName
        }
      }
      paymentMethod
      paymentId
      totalAmount
      status
      createdAt
      updatedAt
    }
  }
`;

export const DASHBOARD_STUDENTS_QUERY = `
  query getDashboardStudents {
    coursesByInstructor {
      _id
      title
      studentCount
      isPublished
      students {
        _id
        userName
        email
      }
      createdAt
    }
  }
`;
