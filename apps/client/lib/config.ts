/**
 * Static configuration data for courses.
 */

export interface CourseImage {
  id: number;
  img: string;
  title: string;
}

export const courseImg: CourseImage[] = [
  {
    id: 1,
    img: "/pic1.jpg",
    title: "image 1",
  },
  {
    id: 2,
    img: "/pic2.jpg",
    title: "image 2",
  },
  {
    id: 3,
    img: "/pic3.jpg",
    title: "image 3",
  },
];
