import CourseDetails from "./_component/course-details";

const Lecture = async ({ params }: { params: { id: string } }) => {
  const postId = (await params).id;

  return (
    <>
      <CourseDetails id={postId} />
    </>
  );
};

export default Lecture;
